import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Measuring our footprint";

export default function Image() {
  return ogImage({ title: alt, kicker: "Sustainability", photo: "/images/sustainability/environmentally-friendly.jpg" });
}
