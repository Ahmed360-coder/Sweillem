import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Contact SWEILLEM";

export default function Image() {
  return ogImage({ title: alt, kicker: "Contact", photo: "/images/logistics/delivery-truck.jpg" });
}
