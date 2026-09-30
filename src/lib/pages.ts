// Page copy for routes whose full content lands in a later milestone.
// Every line here is taken from SWEILLEM's live site, deck or report
// (see content/); nothing is invented. Each milestone replaces its entries
// with the real page and deletes them from this file.

export interface StubPage {
  path: string;
  eyebrow: string;
  title: string;
  lede: string;
  /** Meta description (≤ 160 characters). */
  description: string;
  milestone: number;
  /** What the milestone adds, in plain words. */
  coming: string;
}

export const stubPages = {
  process: {
    path: "/process",
    eyebrow: "Manufacturing process",
    title: "Six steps from Aswan clay to a finished joint",
    lede: "Clay from the Aswan quarry is moulded, dried in computer-controlled Lingl dryers, glazed inside and out, and fired in shuttle kilns at up to 1200 °C over 2 to 4 days.",
    description:
      "How SWEILLEM makes vitrified clay pipes: Aswan clay, extrusion, Lingl dryers, full glazing and firing in shuttle kilns at up to 1200 °C.",
    milestone: 3,
    coming: "A scroll journey through raw material, moulding, drying, glazing, firing and jointing, with the factory photos and the how-it’s-made film.",
  },
  about: {
    path: "/about",
    eyebrow: "About SWEILLEM",
    title: "Ninety years of vitrified clay",
    lede: "In the heart of Cairo, Egypt, SWEILLEM started out in 1935 with a small plant manufacturing vitrified clay pipes. In 1987 it built a new factory with advanced production lines.",
    description:
      "SWEILLEM has made vitrified clay pipes in Egypt since 1935, with a new factory built in 1987 and markets across the GCC, the Arab world and Europe.",
    milestone: 3,
    coming: "The company story, a history timeline from 1935 to Euro Sweillem, and the standards SWEILLEM works to.",
  },
  projects: {
    path: "/projects",
    eyebrow: "Projects",
    title: "Where SWEILLEM pipes are working",
    lede: "Sites in Egypt, Saudi Arabia and Germany, including Makkah and New Alamein City.",
    description: "SWEILLEM vitrified clay pipe projects in Egypt, Saudi Arabia and Germany, including Makkah and New Alamein City.",
    milestone: 5,
    coming: "A projects map with region filters and a photo gallery for each project. Client names, years and pipe sizes are added as SWEILLEM confirms them.",
  },
  "roof-tiles": {
    path: "/roof-tiles",
    eyebrow: "New product line",
    title: "Clay roof tiles",
    lede: "SWEILLEM roofing tiles in terracotta, blue and black.",
    description: "SWEILLEM clay roof tiles in terracotta, blue and black.",
    milestone: 4,
    coming: "A colour viewer for the three tile colours and an enquiry button. Sizes, weights and standards are added when SWEILLEM provides them.",
  },
  downloads: {
    path: "/downloads",
    eyebrow: "Downloads",
    title: "Certificates and catalogues",
    lede: "ISO 9001, ISO 14001, ISO 45001, DIN CERTCO and SASO certificates in one place.",
    description: "Download SWEILLEM certificates: ISO 9001, ISO 14001, ISO 45001, DIN CERTCO and SASO.",
    milestone: 5,
    coming: "A searchable list of every file SWEILLEM publishes, filterable by type and country. Only files we actually hold are listed, so every link opens.",
  },
  contact: {
    path: "/contact",
    eyebrow: "Contact",
    title: "Talk to SWEILLEM",
    lede: "Ask about pipes, fittings or roof tiles, or send a quote request for your project.",
    description: "Contact SWEILLEM Vitrified Clay Pipes Co. about pipes, fittings, roof tiles and quotations.",
    milestone: 6,
    coming: "A contact form, SWEILLEM’s locations in Egypt, Germany and Saudi Arabia, and the confirmed phone numbers and email address.",
  },
  services: {
    path: "/services",
    eyebrow: "Services",
    title: "What we do",
    lede: "How SWEILLEM supports engineers, contractors and buyers on a project.",
    description: "SWEILLEM services for engineers, contractors and buyers of vitrified clay pipes.",
    milestone: 3,
    coming: "The list of services in SWEILLEM’s own words. The live site only shows six identical placeholder boxes, so this page waits for the real list.",
  },
  sustainability: {
    path: "/sustainability",
    eyebrow: "Sustainability",
    title: "Measuring our footprint",
    lede: "SWEILLEM’s 2023 baseline: Scope 1 emissions of about 19,964 t CO₂ (88%) and Scope 2 of about 1,464 t (6.5%), with around 5% of production electricity from renewable sources.",
    description:
      "SWEILLEM’s 2023 carbon baseline: Scope 1 about 19,964 t CO₂, Scope 2 about 1,464 t, and around 5% renewable electricity.",
    milestone: 3,
    coming: "The published 2023 figures drawn as clear charts, and how natural drying has cut Scope 1 emissions since 2020.",
  },
  "euro-sweillem": {
    path: "/euro-sweillem",
    eyebrow: "Euro Sweillem, Germany",
    title: "SWEILLEM’s newest launch",
    lede: "A European central stock with warehouses in Germany.",
    description: "Euro Sweillem: SWEILLEM’s European central stock with warehouses in Germany.",
    milestone: 3,
    coming: "What Euro Sweillem offers contractors in Europe, with its address and contact once SWEILLEM confirms them.",
  },
  quality: {
    path: "/quality",
    eyebrow: "Quality",
    title: "Made and tested to EN 295",
    lede: "SWEILLEM pipes are made to EN 295 in Normal and High strength classes, and to GSO EN 295 for the Gulf.",
    description: "SWEILLEM vitrified clay pipes are made and tested to EN 295 and GSO EN 295 in Normal and High strength classes.",
    milestone: 3,
    coming: "The EN 295 and GSO EN 295 requirements as readable tables instead of pictures.",
  },
  certificates: {
    path: "/certificates",
    eyebrow: "Certificates",
    title: "Certificates",
    lede: "ISO 9001, ISO 14001, ISO 45001, DIN CERTCO and SASO.",
    description: "SWEILLEM quality, environmental and product certificates: ISO 9001, ISO 14001, ISO 45001, DIN CERTCO and SASO.",
    milestone: 3,
    coming: "Each certificate with its issuer and a download link to the PDF.",
  },
  "joint-performance": {
    path: "/joint-performance",
    eyebrow: "Joint performance",
    title: "Watertight joints, tested",
    lede: "Joints are tested for watertightness at 0.5, 1 and 2.4 bar, and for angular deflection to EN 295-3:2012.",
    description: "SWEILLEM pipe joints are tested for watertightness at 0.5, 1 and 2.4 bar and for angular deflection to EN 295-3:2012.",
    milestone: 3,
    coming: "The joint types, the test set-ups and the results.",
  },
} satisfies Record<string, StubPage>;

export type StubKey = keyof typeof stubPages;
