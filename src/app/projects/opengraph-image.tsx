import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Projects";

export default function Image() {
  return ogImage({ title: alt, kicker: "Saudi Arabia, Egypt, Germany", photo: "/images/projects/makkah.jpg" });
}
