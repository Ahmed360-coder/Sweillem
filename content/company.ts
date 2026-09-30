import type { Fact, Location, Project, SourceRef } from "./types";

const live = (path: string): SourceRef => ({ kind: "live-site", url: `https://sweillem.net${path}` });
const deck = (slide: number): SourceRef => ({ kind: "deck", file: "Sweillem vitrified clay pipes.pptx", slide });
const report = (section: string): SourceRef => ({
  kind: "report",
  file: "Sweillem vitrified clay pipes and roof tiles.docx",
  section,
});

export const company = {
  name: "SWEILLEM Vitrified Clay Pipes Co.",
  shortName: "SWEILLEM",
  slogan: "Daring to be the First, working hard for a world-class level",
  taglineArabic: "الأكفأ والأكثر خبرة",
  taglineArabicMeaning: "The most efficient and the most experienced",
  email: "info@sweillem.net",
  phones: ["(+2) 01005382615", "42274480", "42274481", "42274482"],
  markets: "G.C.C, Arab World, East & West European Markets",
  brandColours: {
    // Sampled from the logo in the deck; not yet confirmed by SWEILLEM.
    maroon: "#7a0404",
    grey: "#7f8285",
    liveSiteHeadingRed: "#780f05",
  },
} as const;

export const facts: Fact[] = [
  {
    id: "founded",
    text: "In the heart of Cairo, Egypt, Sweillem started out in 1935 with a small plant manufacturing vitrified clay pipes.",
    source: [live("/about-us/"), live("/"), deck(1)],
    confirmation: "confirmed",
  },
  {
    id: "factory-1987",
    text: "In 1987, Sweillem constructed a new factory with advanced production lines to meet the demands of the local market at the time.",
    source: [live("/about-us/")],
    confirmation: "confirmed",
  },
  {
    id: "factory-1987-technology",
    text: "In 1987, we have constructed a new factory using the German technology in producing clay pipes and using the English, German, and American expertise in this concept.",
    source: [report("Product")],
    confirmation: "confirmed",
  },
  {
    id: "countries-reached",
    text: "Germany, Belgium, Holland, Czech, Italy, Poland, Romania, Hungary, Saudi Arabia, Qatar, Greece, Singapore, Hong Kong, Brunei, etc.",
    source: [live("/about-us/")],
    confirmation: "confirmed",
  },
  {
    id: "stats-years",
    text: "90+ Years of Experience",
    source: [live("/about-us/")],
    confirmation: "confirmed",
  },
  {
    id: "stats-engineers",
    text: "150+ Expert Engineers",
    source: [live("/about-us/")],
    confirmation: "needs-confirmation",
  },
  {
    id: "stats-branches",
    text: "3 Branches in World",
    source: [live("/about-us/")],
    confirmation: "needs-confirmation",
  },
  {
    id: "stats-projects",
    text: "Projects done: 2434 (Home) or 3k (About Us)",
    source: [live("/"), live("/about-us/")],
    confirmation: "needs-confirmation",
    notes: "The two pages disagree; SWEILLEM to confirm the figure.",
  },
  {
    id: "abrasion",
    text: "Vitrified Clay Pipes is the highest abrasion resistant material in the sewage lines due to its natural components which are capable to handle a very high velocity of the sewer running through the pipe lines ( up to 10m/s).",
    source: [live("/about-us/")],
    confirmation: "confirmed",
  },
  {
    id: "corrosion-life",
    text: "The ability to repel corrosion increases the life expectancy of vitrified clay pipes more than 100 years.",
    source: [live("/about-us/"), report("Product")],
    confirmation: "confirmed",
  },
  {
    id: "maintenance-300-bar",
    text: "They can withstand more than 300 bars during underground maintenance.",
    source: [report("Product")],
    confirmation: "needs-confirmation",
    notes: "Only in the internal report; check the claim with SWEILLEM before publishing.",
  },
  {
    id: "raw-material",
    text: "The clay begins its journey from the quarry of Aswan. On arrival at the factory, this raw material is inspected and carefully stored. Quality checks cover the percentage of fine minerals, the percentage of salts and the Al2O3 (aluminum oxide) percentage in the clay.",
    source: [report("Sweillem VCP Manufacture"), deck(6)],
    confirmation: "confirmed",
  },
  {
    id: "moulding",
    text: "Sweillem pays strict attention to maintaining wet clay in the most appropriate atmosphere until it proceeds to the extruders for molding. Specialized handling equipment transports the pipes through this process and on to the dryers in perfect condition.",
    source: [report("Sweillem VCP Manufacture"), deck(7)],
    confirmation: "confirmed",
  },
  {
    id: "drying",
    text: "It is during this phase that the pipes lose most of the water that was a necessary part of the molding process. Control of the dryers which were built under the supervision of the German company (Lingl), is fully computerized.",
    source: [report("Sweillem VCP Manufacture"), deck(8)],
    confirmation: "confirmed",
  },
  {
    id: "glazing",
    text: "After the pipes are dried and pass through the quality control, they are transferred to the Glazing section. Here the clay pipes are fully immersed in the glaze, a thick liquid containing several natural materials. The glaze is transformed during further firing process into a glassy cover, both inside and outside of the pipes which therefore minimizes internal friction and maximizes resistance to absorption of the pipe's inner surfaces.",
    source: [report("Sweillem VCP Manufacture"), deck(9)],
    confirmation: "confirmed",
  },
  {
    id: "firing",
    text: "Final firing is a two-phase operation. Pre-Heating phase: Pipes are subjected to a hot stream of water in a special chamber, which ensures that there are no humidity is left in the pipes. Firing Phase: This is the final vital step in the manufacturing process and, accordingly, Sweillem employs the most advanced shuttle Kilns, produced by a leading German American company. The advanced technology of these Kins ensures the best firing curves for every diameter of pipe, until the maximum firing temperature of 1200 degrees is obtained. Over a period of 2-4 days.",
    source: [report("Sweillem VCP Manufacture"), deck(10)],
    confirmation: "confirmed",
    notes: "Verbatim from the source, typos included; edit for publication.",
  },
  {
    id: "process-steps-live",
    text: "Raw Mat. Preparation, Moulding Process, Drying Process, Glazing Process, Firing Process, Jointing Process",
    source: [live("/about-us/")],
    confirmation: "confirmed",
  },
  {
    id: "ksa-agent",
    text: "Saudi Arabia was the first successful international market, in cooperation with the exclusive agent TAAS (Sweillem TAAS).",
    source: [report("Introduction")],
    confirmation: "needs-confirmation",
    notes: "Report dated 18/3/2024. Confirm TAAS is still the agent and may be named.",
  },
  {
    id: "euro-sweillem",
    text: "Euro Sweillem, Germany: participating in projects all over the world, constantly proving that we are up to international standards.",
    source: [deck(19), deck(20)],
    confirmation: "needs-confirmation",
    notes: 'Deck calls it "Sweillem\'s Newest Launch". No contact details yet.',
  },
  {
    id: "facebook",
    text: "Sweillem has over 20k followers and likes on Facebook.",
    source: [deck(15), report("Promotion")],
    confirmation: "needs-confirmation",
    notes: "Facebook page URL not known.",
  },
  {
    id: "roof-tiles",
    text: "Clay roof tiles are a second product line, shown in terracotta, blue and black under a \"sweillem roofing tiles\" badge. Roof tiles are available in various designs, colors, and profiles.",
    source: [deck(3), deck(21), deck(22)],
    confirmation: "needs-confirmation",
    notes: "No models, sizes, weights or standards supplied.",
  },
  {
    id: "sustainability-2023",
    text: "2023 baseline: Scope 1 19,963.90 t CO₂ (88%); Scope 2 1,464.20 t location-based (6.5%) and 1,259.20 t market-based (5.5%); about 5% of production electricity renewable; Scope 1 down about 5% since 2020 through natural drying; Scope 3 still being developed.",
    source: [live("/sustainability/")],
    confirmation: "confirmed",
  },
];

/** Do not publish: internal figures from the deck and report. */
export const doNotPublish = [
  "Prices quoted in RM on the Pricing slide and in the report (225mm*225mm RM 250.6, 150mm*1.5m RM 83.55).",
  'Market size "USD XX million" placeholder and CAGR figures in the report.',
  "Photos the deck credits to Pexels (see assets-manifest.json, publish: needs-confirmation).",
] as const;

export const locations: Location[] = [
  {
    name: "Cairo Office",
    kind: "office",
    country: "Egypt",
    address: "Osman Towers – Kornish El Neil Aghakhan – Cairo -Egypt",
    source: [live("/contact-us/")],
    confirmation: "needs-confirmation",
  },
  {
    name: "Contact page map pin",
    kind: "unknown",
    country: "Egypt",
    address: "Map embed on Contact Us",
    coordinates: { lat: 30.197005, lng: 31.3178348 },
    source: [live("/contact-us/")],
    confirmation: "needs-confirmation",
    notes: "Pin does not sit on the Nile Corniche office address; confirm what it marks.",
  },
  {
    name: "Cairo",
    kind: "plant",
    country: "Egypt",
    address: "Industrial City. Egypt",
    source: [live("/footer/")],
    confirmation: "needs-confirmation",
    notes: "From the footer block; the kind (plant) is inferred.",
  },
  {
    name: "Saryaqos",
    kind: "plant",
    country: "Egypt",
    address: "Saryaqos (Qalubiya Gov)",
    source: [deck(13), report("Place")],
    confirmation: "needs-confirmation",
    notes: 'Deck: "a pipe supplier in Saryaqos". Exact address and role to confirm.',
  },
  {
    name: "Arab Al Hoson",
    kind: "plant",
    country: "Egypt",
    address: "Arab Al Hoson (El Mataria)",
    source: [deck(13), report("Place")],
    confirmation: "needs-confirmation",
  },
  {
    name: "Germany",
    kind: "warehouse",
    country: "Germany",
    address: "Stiegstraße 60, 41379 Brüggen",
    source: [live("/footer/"), deck(20)],
    confirmation: "needs-confirmation",
    notes: "Footer address; deck shows Germany warehouses and Euro Sweillem. Whether this is the Euro Sweillem address is inferred.",
  },
  {
    name: "Kingdom of Saudi Arabia",
    kind: "agent",
    country: "Saudi Arabia",
    address: "Jeddah, K.S.A",
    source: [live("/footer/"), report("Introduction")],
    confirmation: "needs-confirmation",
  },
];

/**
 * Projects with real evidence (photos and names). The live site's project
 * details (client, date, website, description) are theme placeholders and
 * are deliberately left out.
 */
export const projects: Project[] = [
  {
    slug: "haram-central-area-makkah",
    name: "Haram Central Area, Makkah",
    country: "Saudi Arabia",
    region: "GCC",
    facts: ["Gallery file names say 700 mm diameter pipes in the Haram central area."],
    images: [
      "/images/projects/makkah.jpg",
      "/images/projects/saudi-arabia/haram-central-area-700mm-1.jpg",
    ],
    liveUrl: "https://sweillem.net/projects/riyadh/",
    source: [live("/projects/riyadh/"), deck(16)],
    confirmation: "needs-confirmation",
  },
  {
    slug: "sharurah-drainage",
    name: "Sharurah drainage project",
    country: "Saudi Arabia",
    region: "GCC",
    facts: ["Gallery file name says 400 mm diameter, Sharurah drainage project."],
    images: ["/images/projects/saudi-arabia/sharurah-drainage-400mm.jpg"],
    liveUrl: "https://sweillem.net/projects/riyadh/",
    source: [live("/projects/riyadh/")],
    confirmation: "needs-confirmation",
  },
  {
    slug: "new-alamein-city",
    name: "New Alamein City",
    country: "Egypt",
    region: "Egypt",
    facts: [],
    images: ["/images/projects/new-alamein-city.jpg", "/images/projects/egypt/alamein-2.jpg"],
    source: [deck(17), live("/")],
    confirmation: "needs-confirmation",
  },
  {
    slug: "germany",
    name: "Germany (Euro Sweillem central stock)",
    country: "Germany",
    region: "Europe",
    facts: [],
    images: ["/images/projects/germany-site.jpg", "/images/logistics/europe-central-stock-germany.jpg"],
    liveUrl: "https://sweillem.net/projects/haram-central-area/",
    source: [live("/projects/haram-central-area/"), deck(16), deck(20)],
    confirmation: "needs-confirmation",
  },
];
