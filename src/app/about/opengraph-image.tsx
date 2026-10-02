import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "About SWEILLEM";

export default function Image() {
  return ogImage({ title: alt, kicker: "Since 1935", photo: "/images/company/since-1935.jpg" });
}
