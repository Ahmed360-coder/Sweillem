import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Vitrified clay pipes and fittings";

export default function Image() {
  return ogImage({ title: alt, kicker: "Products", photo: "/images/manufacturing/glazed-pipes-01.jpg" });
}
