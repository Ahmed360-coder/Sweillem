import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Vitrified clay pipes since 1935";

export default function Image() {
  return ogImage({ title: alt, kicker: "Made in Egypt to EN 295", photo: "/images/projects/germany-site.jpg" });
}
