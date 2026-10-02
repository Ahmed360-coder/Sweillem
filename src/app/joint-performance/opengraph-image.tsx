import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Joint performance";

export default function Image() {
  return ogImage({ title: alt, kicker: "Quality", photo: "/images/quality/joint-angular-deflection.jpg" });
}
