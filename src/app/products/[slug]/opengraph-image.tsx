import { products } from "@content/products";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "SWEILLEM vitrified clay product";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = products.find((p) => p.slug === slug)?.name ?? "Products";
  return ogImage({ title: name, kicker: "Vitrified clay products", photo: "/images/manufacturing/glazed-pipes-01.jpg" });
}
