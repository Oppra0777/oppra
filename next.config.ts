import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The stylesheet is small and this is a single-page site, so shipping it in
  // the document beats a render-blocking round trip for the CSS file.
  experimental: { inlineCss: true },
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
