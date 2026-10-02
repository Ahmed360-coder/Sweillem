import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // WordPress put a slash on the end of every address. legacyRedirects() strips it
  // itself, so an old link reaches its new page in one hop instead of two.
  skipTrailingSlashRedirect: true,
  // Old sweillem.net (WordPress) addresses keep working after the switch.
  async redirects() {
    return legacyRedirects();
  },
};

export default nextConfig;
