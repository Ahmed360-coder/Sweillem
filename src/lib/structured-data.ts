// schema.org data for search engines. Only facts SWEILLEM already publishes
// (content/company.ts); nothing here is shown on the page.
import { company } from "@content/company";
import { site, siteUrl } from "./site";

/** "(+2) 01005382615" → "+20 100 538 2615" (Egyptian mobile, international form). */
const mobile = company.phones[0].replace(/^\(\+2\)\s*0?/, "+20 ").replace(/^(\+20 )(\d{3})(\d{3})(\d{4})$/, "$1$2 $3 $4");

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
        telephone: mobile,
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
