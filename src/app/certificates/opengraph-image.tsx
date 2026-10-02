import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Certificates";

export default function Image() {
  return ogImage({ title: alt, kicker: "Quality", photo: "/images/certificates/iso-9001.jpg" });
}
