import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Made and tested to EN 295";

export default function Image() {
  return ogImage({ title: alt, kicker: "Quality", photo: "/images/manufacturing/quality-control.jpg" });
}
