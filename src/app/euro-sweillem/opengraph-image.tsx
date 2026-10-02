import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Euro Sweillem, Germany";

export default function Image() {
  return ogImage({ title: alt, kicker: "Company", photo: "/images/logistics/germany-warehouses.jpg" });
}
