// Data for the projects map in the header (MapPanel). It is put together on
// the server in the root layout and handed to the panel as props, so the
// content files stay out of the browser bundle.
import { projects } from "@content/company";
import reach from "./reach-map.json";
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
  image?: { src: string; alt: string; pos?: string };
  /** The place the export routes start from. */
  origin?: boolean;
}

export interface MapMarket {
  id: string;
  name: string;
  region: Exclude<MapRegion, "world">;
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
    name: "A site in Germany",
    short: "Germany",
    place: "Germany",
    text: "SWEILLEM pipes on a site in Germany. The map marks the country, as the town is not given.",
    side: "right",
    image: { src: "/images/projects/germany-site.jpg", alt: "SWEILLEM pipes on a site in Germany" },
  },
};

/** Where the market list on About puts each country. */
const marketRegion: Record<string, MapMarket["region"]> = {
  "Saudi Arabia": "middle-east",
  Qatar: "middle-east",
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
      return { id: p.slug, layer: "projects", region: regionOf[p.slug], ...pin, ...copy };
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
      ...at("cairo"),
    },
    {
      id: "brueggen",
      layer: "distribution",
      name: "Brüggen",
      short: "Brüggen",
      place: "Germany",
      text: "SWEILLEM’s address in Germany, as listed on sweillem.net. Euro Sweillem, the European central stock, has its warehouses in Germany.",
      region: "europe",
      side: "left",
      ...at("brueggen"),
    },
    {
      id: "jeddah",
      layer: "distribution",
      name: "Jeddah",
      short: "Jeddah",
      place: "Saudi Arabia",
      text: "SWEILLEM’s address in Saudi Arabia, as listed on sweillem.net. Saudi Arabia was SWEILLEM’s first market outside Egypt.",
      region: "middle-east",
      side: "left",
      ...at("jeddah"),
    },
  ],
  markets: reach.markets.map((m) => ({ id: m.id, name: m.name, region: marketRegion[m.name] ?? "europe" })),
};
