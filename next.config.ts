import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/redirects";

// The production domain (and its www). Any other host serving this build, such as
// sweillem.vercel.app or a preview, is sent noindex so only the real domain is indexed.
const siteHost = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sweillem.net").hostname.replace(/^www\./, "");
const hostPattern = `(www\\.)?${siteHost.replace(/\./g, "\\.")}`;

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
  async headers() {
    return [
      {
        source: "/:path*",
        missing: [{ type: "host", value: hostPattern }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
