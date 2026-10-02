import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Product explorer";

export default function Image() {
  return ogImage({ title: alt, kicker: "Products", photo: "/images/manufacturing/pipes-in-production.jpg" });
}
