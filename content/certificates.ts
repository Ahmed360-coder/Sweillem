import type { Certificate } from "./types";

/**
 * The Downloads table on the live site (https://sweillem.net/resources/),
 * in its order. Six entries link to "https://eg" (broken) and have no file.
 */
export const certificates: Certificate[] = [
  {
    name: "Cradle to Cradle",
    country: "Global",
    externalUrl: "https://c2ccertified.org/certified-products/vitrified-clay-pipe-dn-125-to-dn-1000-with-accessories",
    status: "external",
    notes:
      "Listed with the C2C registry link in the Description column and no file. A scan named Sweil_Vitri_Bronz_CERT9605_2025-05-06 is in the media library (see assets manifest).",
  },
  {
    name: "ISO 9001",
    country: "Egypt",
    file: "/downloads/certificates/iso-9001-2024.pdf",
    liveUrl: "https://sweillem.net/wp-content/uploads/2025/02/8488-Sweillem-Vitrified-Clay-Pipes-ISO-9001-Certificate-June-2024-signed-sealed.pdf",
    status: "pending-download",
  },
  {
    name: "DIN CERTCO",
    country: "Germany",
    file: "/downloads/certificates/din-certco-2027.pdf",
    liveUrl: "https://sweillem.net/wp-content/uploads/2025/02/DIN-CERTCO31-05-2027-EN.pdf",
    status: "pending-download",
    notes: "File name suggests validity to 31-05-2027.",
  },
  {
    name: "SASO",
    country: "KSA",
    file: "/downloads/certificates/saso-2022-2025.pdf",
    liveUrl: "https://sweillem.net/wp-content/uploads/2025/02/SASO-2022-2025.pdf",
    status: "pending-download",
    notes: "File name says 2022 to 2025; may have expired.",
  },
  { name: "BENOR", country: "Belgium", status: "missing", notes: 'Live link is "https://eg".' },
  { name: "CERTIFIKA'T", country: "Czech Republic", status: "missing", notes: 'Live link is "https://eg".' },
  { name: "NOPWASD", country: "Egypt", status: "missing", notes: 'Live link is "https://eg".' },
  { name: "NF CSTB 108", country: "French", status: "missing", notes: 'Live link is "https://eg".' },
  { name: "NL BSB", country: "Netherlands", status: "missing", notes: 'Live link is "https://eg".' },
  { name: "TUV", country: "Singapore", status: "missing", notes: 'Live link is "https://eg".' },
  {
    name: "ISO 45001: 2024",
    country: "Egypt",
    category: "Safety",
    file: "/downloads/certificates/iso-45001-2024.pdf",
    liveUrl: "https://sweillem.net/wp-content/uploads/2025/02/9720-Sweillem-Vitrified-Clay-Pipes-ISO-45001-Certificate-Apr-2024-signed-sealed.pdf",
    status: "pending-download",
    notes: "About Us lists OHSAS 18001:2007 instead; ask which is current.",
  },
  {
    name: "ISO 14001",
    country: "Egypt",
    category: "Safety",
    file: "/downloads/certificates/iso-14001-2024.pdf",
    liveUrl: "https://sweillem.net/wp-content/uploads/2025/02/8401-Sweillem-Vitrified-Clay-Pipes-ISO-14001-Certificate-Apr-2024-signed-sealed.pdf",
    status: "pending-download",
    notes: 'Labelled "Safety" on the live site; ISO 14001 is an environmental standard.',
  },
];

/** Standards named in the About Us text (not all have a certificate file). */
export const standardsClaimed = [
  "Egyptian Standards (ES 56/2005)",
  "Saudi Standards (SASO GSO EN 295/2008)",
  "European Standards (EN 295)",
  "German standard (ZPWN 295:2016)",
  "American Standards (ASTM-C700)",
  "ISO 9001:2015",
  "ISO 14001:2015",
  "OHSAS 18001:2007",
] as const;
