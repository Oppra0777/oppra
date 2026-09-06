/**
 * Bundles the Cloudflare Worker immediately after `next build`.
 *
 * Cloudflare Workers Builds runs the build command (`pnpm run build`) and then
 * the deploy command (`npx wrangler deploy`). wrangler detects the OpenNext
 * project and delegates straight to `opennextjs-cloudflare deploy`, which
 * expects `.open-next/` to already exist. Nothing else in that pipeline creates
 * it, so the deploy fails with:
 *
 *   ERROR Could not find compiled Open Next config, did you run the build command?
 *
 * Running the bundle here fixes that without touching the dashboard settings.
 *
 * This deliberately does NOT pass --skipNextBuild, even though `next build` has
 * just run. That flag skips setStandaloneBuildMode() along with the build, and
 * the worker bundler reads from `.next/standalone/` — which a plain `next build`
 * does not produce. Letting the adapter run its own Next build is what makes the
 * standalone output exist. The cost is one extra `next build` (~8s in CI).
 *
 * Skipped on Windows, where @opennextjs/cloudflare's esbuild step fails on
 * pnpm's symlinked store ("Access is denied") — the tool itself recommends WSL.
 * This repo is developed on Windows, so running it there would break the local
 * `pnpm build`. CI is Linux, which is what matters for deployment.
 */
import { spawnSync } from "node:child_process";

const REENTRY_FLAG = "OPPRA_CF_BUNDLING";

/*
  Recursion guard. OpenNext shells out to a build command to produce the
  standalone Next output, and if that command is ever this package's `build`
  script again, the two call each other forever — a hang, not an error, which
  burns CI minutes and looks like a slow build.

  open-next.config.ts sets `buildCommand: "next build"` so this should never
  trigger. It stays as a cheap backstop in case that config is lost.
*/
if (process.env[REENTRY_FLAG]) {
  console.log("cf-postbuild: already inside the Cloudflare bundle; not recursing.");
  process.exit(0);
}

if (process.platform === "win32") {
  console.log(
    "\ncf-postbuild: skipping the Cloudflare Worker bundle on Windows.\n" +
      "  next build output in .next/ is complete. The bundle runs in CI (Linux),\n" +
      "  or locally under WSL via `pnpm run deploy`.\n"
  );
  process.exit(0);
}

console.log("\ncf-postbuild: bundling the Cloudflare Worker into .open-next/ ...\n");

const result = spawnSync(
  "opennextjs-cloudflare",
  ["build"],
  {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, [REENTRY_FLAG]: "1" },
  }
);

if (result.error) {
  console.error("cf-postbuild: failed to start opennextjs-cloudflare:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
