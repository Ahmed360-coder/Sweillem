// schema.org data for search engines. Only facts SWEILLEM already publishes
// (content/company.ts); nothing here is shown on the page.
import { company } from "@content/company";
import { mobile } from "./contact";
import { site, siteUrl } from "./site";

export function organizationJsonLd(): string {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: site.legalName,
        alternateName: [site.name, "Sweillem"],
        url: siteUrl,
        logo: `${siteUrl}/images/brand/sweillem-logo.png`,
        description: site.description,
        foundingDate: String(site.founded),
        foundingLocation: { "@type": "Place", name: "Cairo, Egypt" },
        slogan: site.slogan,
        email: company.email,
        telephone: mobile.display,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Osman Towers, Kornish El Neil",
          addressLocality: "Cairo",
          addressCountry: "EG",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: site.name,
        inLanguage: "en",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
