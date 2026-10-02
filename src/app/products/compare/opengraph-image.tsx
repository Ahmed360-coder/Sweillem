import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Compare N and H class pipes";

export default function Image() {
  return ogImage({ title: alt, kicker: "Products", photo: "/images/manufacturing/glazed-pipes-02.jpg" });
}
