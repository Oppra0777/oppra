import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

const config = {
  ...defineCloudflareConfig({
    // For best results consider enabling R2 caching
    // See https://opennext.js.org/cloudflare/caching for more details
    // incrementalCache: r2IncrementalCache
  }),

  /*
    Run Next directly instead of the package script.

    By default OpenNext shells out to `pnpm build` to produce the standalone
    Next output. Our `build` script also invokes the Cloudflare bundler (so that
    Workers Builds produces .open-next/ without a dashboard change), so the
    default would recurse forever:

      pnpm build -> next build -> cf-postbuild -> opennextjs-cloudflare build
                 -> pnpm build -> ... never terminates

    Pointing at `next build` breaks the cycle. Standalone output is unaffected:
    setStandaloneBuildMode() works by exporting NEXT_PRIVATE_STANDALONE, which
    the child process inherits either way.
  */
  buildCommand: "next build",
};

export default config;
