import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Preview deployments are closed to crawlers; production opens up at launch (Milestone 8).
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
