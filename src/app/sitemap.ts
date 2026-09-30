import type { MetadataRoute } from "next";
import { siteUrl, staticRoutes } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path.startsWith("/products") ? 0.8 : 0.6,
  }));
}
