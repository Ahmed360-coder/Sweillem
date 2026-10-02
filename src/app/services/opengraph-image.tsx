import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "How SWEILLEM supports a project";

export default function Image() {
  return ogImage({ title: alt, kicker: "Services", photo: "/images/logistics/europe-central-stock-germany.jpg" });
}
