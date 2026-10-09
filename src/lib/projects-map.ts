// Data for the projects map in the header (MapPanel). It is put together on
// the server in the root layout and handed to the panel as props, so the
// content files stay out of the browser bundle.
import { projects } from "@content/company";
import exportMap from "./export-map.json";
import pins from "./map-places.json";

export type MapRegion = keyof typeof pins.views;
export type MapLayer = "projects" | "distribution";

export interface MapPlace {
  id: string;
  layer: MapLayer;
  name: string;
  /** The name on the map pin. */
  short: string;
  /** Where it is, in words. */
  place: string;
  text: string;
  region: Exclude<MapRegion, "world">;
  x: number;
  y: number;
  /** Which side of the pin its label sits on, so neighbours do not overlap. */
  side: "left" | "right";
  /** A photo, or a drawing where SWEILLEM's material has no photo of the place. */
  image?: { src: string; alt: string; pos?: string } | { drawn: "port"; alt: string };
  /** The place the export routes start from. */
  origin?: boolean;
  /** Country flag, by ISO 3166-1 alpha-2 code (public/images/flags). */
  flag: Flag;
}

export interface MapMarket {
  id: string;
  name: string;
  region: Exclude<MapRegion, "world">;
  flag: Flag;
  /** "about": named on SWEILLEM's About Us page; "map": filled red on SWEILLEM's own export map. */
  source: "about" | "map";
}

/**
 * The flags the map uses, from the flag-icons set (MIT, public/images/flags/LICENSE.txt),
 * copied into the site so nothing is loaded from elsewhere.
 */
export type Flag =
  | "eg" | "sa" | "de" | "be" | "nl" | "cz" | "it" | "pl" | "ro" | "hu" | "qa" | "gr" | "sg" | "hk" | "bn"
  | "fr" | "es" | "at" | "bg" | "sy" | "lb" | "jo" | "kw";

/** Flag of each project's country (content/company.ts). */
const countryFlag: Record<string, Flag> = { Egypt: "eg", "Saudi Arabia": "sa", Germany: "de" };

/** Flag of each export market, by its ISO 3166-1 numeric id (export-map.json). */
const marketFlag: Record<string, Flag> = {
  "276": "de",
  "056": "be",
  "528": "nl",
  "203": "cz",
  "380": "it",
  "616": "pl",
  "642": "ro",
  "348": "hu",
  "682": "sa",
  "634": "qa",
  "300": "gr",
  "702": "sg",
  "344": "hk",
  "096": "bn",
  "250": "fr",
  "724": "es",
  "040": "at",
  "100": "bg",
  "760": "sy",
  "422": "lb",
  "400": "jo",
  "414": "kw",
};

function flagOf(table: Record<string, Flag>, key: string): Flag {
  const flag = table[key];
  if (!flag) throw new Error(`The projects map has no flag for ${key} (src/lib/projects-map.ts)`);
  return flag;
}

export interface MapData {
  places: MapPlace[];
  markets: MapMarket[];
}

/** Photos and wording for the projects SWEILLEM shows (content/company.ts). */
const projectCopy: Record<string, Pick<MapPlace, "name" | "short" | "place" | "text" | "side" | "image">> = {
  "haram-central-area-makkah": {
    name: "Haram central area",
    short: "Makkah",
    place: "Makkah, Saudi Arabia",
    text: "Large SWEILLEM pipes on a project in the Haram central area of Makkah.",
    side: "right",
    image: { src: "/images/projects/makkah-crop.webp", alt: "Large SWEILLEM pipes on a project in Makkah, near the Haram" },
  },
  "sharurah-drainage": {
    name: "Sharurah drainage project",
    short: "Sharurah",
    place: "Sharurah, Saudi Arabia",
    text: "A drainage line of SWEILLEM pipes in Sharurah, in the south of Saudi Arabia.",
    side: "right",
    image: {
      src: "/images/projects/saudi-arabia/sharurah-drainage-400mm.jpg",
      alt: "A line of SWEILLEM pipes laid in a shored trench in Sharurah",
      pos: "object-[50%_70%]",
    },
  },
  "new-alamein-city": {
    name: "New Alamein City",
    short: "New Alamein",
    place: "Egypt",
    text: "SWEILLEM pipes for New Alamein City on Egypt’s north coast.",
    side: "left",
    image: { src: "/images/projects/new-alamein-crop.webp", alt: "SWEILLEM pipes waiting to be laid in New Alamein City" },
  },
  germany: {
    name: "Sites in Germany",
    short: "Germany",
    place: "Germany",
    text: "SWEILLEM pipes on sites across Germany.",
    side: "right",
    image: { src: "/images/projects/germany-site.jpg", alt: "SWEILLEM pipes on a site in Germany" },
  },
};

/** Which part of the map each market is in (the rest are in Europe). */
const marketRegion: Record<string, MapMarket["region"]> = {
  "Saudi Arabia": "middle-east",
  Qatar: "middle-east",
  Syria: "middle-east",
  Lebanon: "middle-east",
  Jordan: "middle-east",
  Kuwait: "middle-east",
  Singapore: "far-east",
  "Hong Kong": "far-east",
  Brunei: "far-east",
};

const regionOf: Record<string, MapPlace["region"]> = {
  "haram-central-area-makkah": "middle-east",
  "sharurah-drainage": "middle-east",
  "new-alamein-city": "middle-east",
  germany: "europe",
};

const at = (id: keyof typeof pins.places) => pins.places[id];

export const mapData: MapData = {
  places: [
    ...projects.map((p): MapPlace => {
      const copy = projectCopy[p.slug];
      const pin = at(p.slug as keyof typeof pins.places);
      if (!copy || !pin) throw new Error(`The projects map has no pin for ${p.slug} (scripts/build-map-places.mjs)`);
      return { id: p.slug, layer: "projects", region: regionOf[p.slug], flag: flagOf(countryFlag, p.country), ...pin, ...copy };
    }),
    {
      id: "cairo",
      layer: "distribution",
      name: "Cairo",
      short: "Cairo",
      place: "Egypt",
      text: "SWEILLEM began in Cairo in 1935, and its factory is in Saryaqos, Qalyubia, near the city. Every route on the map starts here.",
      region: "middle-east",
      side: "right",
      origin: true,
      flag: "eg",
      image: { src: "/images/site/glazed.webp", alt: "Glazed SWEILLEM pipes at the factory near Cairo, after the final firing" },
      ...at("cairo"),
    },
    {
      id: "brueggen",
      layer: "distribution",
      name: "Brüggen",
      short: "Brüggen",
      place: "Germany",
      text: "Our address in Germany. Euro Sweillem, the European central stock, has its warehouses in Germany.",
      region: "europe",
      side: "right",
      flag: "de",
      image: { src: "/images/logistics/germany-warehouses-crop.webp", alt: "SWEILLEM’s warehouses in Germany, in the snow" },
      ...at("brueggen"),
    },
    {
      id: "jeddah",
      layer: "distribution",
      name: "Jeddah",
      short: "Jeddah",
      place: "Saudi Arabia",
      text: "Our address in Saudi Arabia, SWEILLEM’s first successful market outside Egypt.",
      region: "middle-east",
      side: "left",
      flag: "sa",
      image: { drawn: "port", alt: "Drawing of SWEILLEM pipes stacked on a quay by the Red Sea." },
      ...at("jeddah"),
    },
  ],
  markets: exportMap.markets.map((m) => ({
    id: m.id,
    name: m.name,
    region: marketRegion[m.name] ?? "europe",
    flag: flagOf(marketFlag, m.id),
    source: m.source === "map" ? "map" : "about",
  })),
};
