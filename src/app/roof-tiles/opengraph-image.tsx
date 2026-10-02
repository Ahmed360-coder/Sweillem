import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Clay roof tiles";

export default function Image() {
  return ogImage({ title: alt, kicker: "Terracotta, blue and black", photo: "/images/roof-tiles/tile-terracotta.jpg" });
}
