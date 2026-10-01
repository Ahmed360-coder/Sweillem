import { company } from "@content/company";
import { products } from "@content/products";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sweillem.net").replace(/\/$/, "");

export const site = {
  name: company.shortName,
  legalName: company.name,
  slogan: company.slogan,
  description:
    "Glazed vitrified clay pipes and fittings for sewer and drainage networks, made in Egypt since 1935 to EN 295.",
  founded: 1935,
} as const;

export interface NavItem {
  href: string;
  label: string;
}

/** Main navigation, in the order of the redesign prototype. */
export const mainNav: NavItem[] = [
  { href: "/products", label: "Products" },
  { href: "/process", label: "How it’s made" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/roof-tiles", label: "Roof tiles" },
  { href: "/downloads", label: "Downloads" },
  { href: "/contact", label: "Contact" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Products",
    items: [
      ...products.slice(0, 5).map((p) => ({ href: `/products/${p.slug}`, label: p.name })),
      { href: "/products", label: "All products" },
      { href: "/roof-tiles", label: "Roof tiles" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "About" },
      { href: "/process", label: "How it’s made" },
      { href: "/services", label: "Services" },
      { href: "/sustainability", label: "Sustainability" },
      { href: "/euro-sweillem", label: "Euro Sweillem" },
      { href: "/projects", label: "Projects" },
    ],
  },
  {
    title: "Quality",
    items: [
      { href: "/quality", label: "Quality" },
      { href: "/certificates", label: "Certificates" },
      { href: "/joint-performance", label: "Joint performance" },
      { href: "/downloads", label: "Downloads" },
    ],
  },
  {
    title: "Contact",
    items: [
      { href: "/contact", label: "Contact us" },
      { href: "/quote", label: "Quote list" },
    ],
  },
];

/** Every page, grouped, for the side menu. */
export const siteMap: { title: string; items: NavItem[] }[] = [
  { title: "Start", items: [{ href: "/", label: "Home" }] },
  {
    title: "Products",
    items: [
      { href: "/products", label: "All products" },
      { href: "/products/explorer", label: "Product explorer" },
      { href: "/products/compare", label: "Compare N and H class" },
      ...products.map((p) => ({ href: `/products/${p.slug}`, label: p.name })),
      { href: "/roof-tiles", label: "Roof tiles" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "About" },
      { href: "/process", label: "How it’s made" },
      { href: "/projects", label: "Projects" },
      { href: "/services", label: "Services" },
      { href: "/sustainability", label: "Sustainability" },
      { href: "/euro-sweillem", label: "Euro Sweillem" },
    ],
  },
  {
    title: "Quality",
    items: [
      { href: "/quality", label: "Quality" },
      { href: "/certificates", label: "Certificates" },
      { href: "/joint-performance", label: "Joint performance" },
      { href: "/downloads", label: "Downloads" },
    ],
  },
  {
    title: "Contact",
    items: [
      { href: "/contact", label: "Contact us" },
      { href: "/quote", label: "Quote list" },
    ],
  },
];

/** Every static route, for the sitemap and the smoke tests. */
export const staticRoutes = [
  "/",
  ...mainNav.map((n) => n.href),
  "/services",
  "/sustainability",
  "/euro-sweillem",
  "/quality",
  "/certificates",
  "/joint-performance",
  "/quote",
  "/products/explorer",
  "/products/compare",
  ...products.map((p) => `/products/${p.slug}`),
];
