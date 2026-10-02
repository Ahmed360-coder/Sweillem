import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Downloads";

export default function Image() {
  return ogImage({ title: alt, kicker: "Certificates and spec sheets", photo: "/images/certificates/din-certco.jpg" });
}
