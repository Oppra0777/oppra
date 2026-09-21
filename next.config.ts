import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The stylesheet is small and this is a single-page site, so shipping it in
    // the document beats a render-blocking round trip for the CSS file.
    inlineCss: true,
    // cf-postbuild.mjs deliberately runs `next build` twice in one CI job (see
    // its comments: once directly, again via OpenNext's `buildCommand` to
    // produce the standalone output). Turbopack's persistent build cache
    // isn't safe across two back-to-back invocations in the same job — the
    // second run crashes trying to read a *.sst cache segment the first run
    // hadn't finished writing ("Unable to open static sorted file ... No such
    // file or directory"). There's no cross-run benefit to keep it for either:
    // Cloudflare's own build cache is what would carry state between deploys.
    turbopackFileSystemCacheForBuild: false,
  },
  poweredByHeader: false,
  images: {
    // AVIF first, WebP for browsers without it.
    formats: ["image/avif", "image/webp"],
    // Nothing on the page renders wider than ~440 CSS px, so the default ladder
    // up to 3840px only bloated the srcset markup in the document.
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 128, 200, 256, 384],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;

// Makes Cloudflare bindings available to `next dev`. Harmless in production
// builds; caught so a failed import cannot become an unhandled rejection.
import("@opennextjs/cloudflare")
  .then((m) => m.initOpenNextCloudflareForDev())
  .catch(() => {});
