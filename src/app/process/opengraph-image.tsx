import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "How vitrified clay pipes are made";

export default function Image() {
  return ogImage({ title: alt, kicker: "How it’s made", photo: "/images/manufacturing/pipes-on-kiln-car.jpg" });
}
