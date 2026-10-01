// Photo galleries for the Projects page. Every photo comes from the project
// galleries on sweillem.net or from SWEILLEM's company deck (see
// content/assets-manifest.json). The live project pages' client, date, website
// and description fields are theme template text, so none of them is used
// (docs/content-gaps.md 4.1, 9.1).
import { projects } from "@content/company";

export interface Photo {
  src: string;
  alt: string;
}

export interface ProjectStory {
  /** Matches the slug in content/company.ts and the pin on the projects map. */
  id: string;
  name: string;
  place: string;
  country: string;
  /** What the photos and SWEILLEM's own files say, nothing more. */
  facts: string[];
  /** Where the facts and photos come from, in words. */
  source: string;
  photos: Photo[];
  /** False for photos whose site is not named, so there is no pin. */
  onMap: boolean;
}

const sa = (file: string) => `/images/projects/saudi-arabia/${file}`;
const de = (file: string) => `/images/projects/germany/${file}`;
const eg = (file: string) => `/images/projects/egypt/${file}`;

const haramAlt = "Large SWEILLEM pipes near the Haram in Makkah";

export const projectStories: ProjectStory[] = [
  {
    id: "haram-central-area-makkah",
    name: "Haram central area",
    place: "Makkah, Saudi Arabia",
    country: "Saudi Arabia",
    facts: [
      "Pipes of 700 mm diameter, as the photo file names say.",
      "Most of the photos are dated 20 June 2012 in their file names.",
    ],
    source: "Photos from the Saudi Arabia gallery on sweillem.net and slide 16 of SWEILLEM’s company deck.",
    onMap: true,
    photos: [
      { src: sa("haram-central-area-700mm-1.jpg"), alt: `${haramAlt}: a stack of 700 mm pipes in front of a hotel tower` },
      { src: sa("haram-central-area-700mm-2.jpg"), alt: `${haramAlt}: pipe ends in a row, with the minarets and a crane behind` },
      { src: sa("haram-central-area-700mm-3.jpg"), alt: `${haramAlt}: a crane lifts two pipes in front of a tower` },
      { src: sa("haram-central-area-700mm-5.jpg"), alt: `${haramAlt}: stacked pipes below the hotel towers` },
      { src: sa("haram-central-area-700mm-4.jpg"), alt: `${haramAlt}: pipes stacked between two towers` },
      { src: sa("gallery-01.jpg"), alt: `${haramAlt}: a lorry crane unloads pipes, with the minarets behind` },
      { src: sa("gallery-03.jpg"), alt: `${haramAlt}: a close view into a pipe socket, with the minarets behind` },
      { src: sa("gallery-04.jpg"), alt: `${haramAlt}: a pipe on the ground beside the site fence` },
      { src: sa("gallery-05.jpg"), alt: `${haramAlt}: a pipe beside the road, with the minarets behind` },
      { src: sa("gallery-06.jpg"), alt: `${haramAlt}: a pipe lying beside the road near the Haram` },
      { src: sa("gallery-07.jpg"), alt: `${haramAlt}: a strapped pipe lifted at the site fence` },
      { src: sa("gallery-08.jpg"), alt: `${haramAlt}: pipes stacked below the towers, a crane arm above` },
      { src: sa("gallery-09.jpg"), alt: `${haramAlt}: a crane lifts two pipes in front of the hotel towers` },
      { src: sa("gallery-10.jpg"), alt: `${haramAlt}: a crane swings a pipe past a building under construction` },
      { src: sa("haram-central-area-700mm-6.jpg"), alt: `${haramAlt}: a pipe at night under the clock tower` },
      { src: sa("haram-central-area-700mm-7.jpg"), alt: `${haramAlt}: a stack of pipes at night under the clock tower` },
    ],
  },
  {
    id: "sharurah-drainage",
    name: "Sharurah drainage project",
    place: "Sharurah, Saudi Arabia",
    country: "Saudi Arabia",
    facts: ["Pipes of 400 mm diameter, as the photo file name says."],
    source: "Photo from the Saudi Arabia gallery on sweillem.net.",
    onMap: true,
    photos: [{ src: sa("sharurah-drainage-400mm.jpg"), alt: "A line of SWEILLEM pipes laid in a shored trench in Sharurah" }],
  },
  {
    id: "new-alamein-city",
    name: "New Alamein City",
    place: "North coast, Egypt",
    country: "Egypt",
    facts: ["Shown by SWEILLEM in its company deck and on the home page of sweillem.net."],
    source: "Photos from slide 17 of SWEILLEM’s company deck and the home page of sweillem.net.",
    onMap: true,
    photos: [
      { src: eg("alamein-2.jpg"), alt: "Rows of SWEILLEM pipes on the sand at New Alamein City, with the city’s towers behind" },
      {
        src: "/images/projects/new-alamein-city.jpg",
        alt: "SWEILLEM’s New Alamein City page from its deck: pipes in a trench, pipes on site and the city’s towers by the sea",
      },
    ],
  },
  {
    id: "germany",
    name: "Sites in Germany",
    place: "Germany",
    country: "Germany",
    facts: [
      "Pipes laid in town streets. A Euro Sweillem banner stands on one of the sites; Euro Sweillem is SWEILLEM’s central stock in Germany.",
      "The towns are not named, so the map marks the country.",
    ],
    source: "Photos from the Germany gallery on sweillem.net and slide 16 of SWEILLEM’s company deck.",
    onMap: true,
    photos: [
      { src: "/images/projects/germany-site.jpg", alt: "SWEILLEM pipes on a site in Germany at sunset, with a Euro Sweillem banner" },
      { src: de("gallery-10.jpg"), alt: "Two large pipes on a building site beside a road in Germany" },
      { src: de("gallery-11.jpg"), alt: "A row of pipes behind the site fence of a main road, a cyclist passing" },
      { src: de("gallery-07.jpg"), alt: "An excavator lowers a pipe into a residential street" },
      { src: de("gallery-09.jpg"), alt: "An excavator and stacked pipes in a street of houses" },
      { src: de("gallery-08.jpg"), alt: "Pipes stacked in a street, ready to be laid" },
      { src: de("gallery-12.jpg"), alt: "A pipe hangs from a digger above a shored trench" },
      { src: de("gallery-04.jpg"), alt: "A wheeled excavator working in a street trench" },
      { src: de("gallery-06.webp"), alt: "A pipe line laid in a narrow trench beside a road" },
      { src: de("gallery-13.jpg"), alt: "A street closed for the works, with machines at the far end" },
      { src: de("gallery-14.jpg"), alt: "Pipes laid out along a road beside a shop car park" },
      { src: de("gallery-16.jpg"), alt: "A crawler excavator beside an open trench and pipes" },
      { src: de("gallery-15.jpg"), alt: "A loader and barriers on a street corner during the works" },
      { src: de("gallery-17.jpg"), alt: "Pipes behind barriers on a tree-lined road" },
      { src: de("gallery-18.jpg"), alt: "Pipes stacked along a footpath behind barriers" },
      { src: de("gallery-19.jpg"), alt: "Works in a shopping street, with steel plates over the trench" },
    ],
  },
  {
    id: "more-from-egypt",
    name: "More from Egypt",
    place: "Egypt",
    country: "Egypt",
    facts: ["From the Egypt gallery on sweillem.net. The sites are not named, so they are not on the map."],
    source: "Photos from the Egypt gallery on sweillem.net.",
    onMap: false,
    photos: [
      { src: eg("gallery-01.webp"), alt: "A pipe line laid on a gravel bed at the bottom of a trench" },
      { src: eg("gallery-02.webp"), alt: "A pipe end showing in a trench, with a digger above" },
      { src: eg("gallery-03.png"), alt: "Seen from above: stacks of pipes in a yard beside four lorries" },
    ],
  },
];

// Every project on the map must have a gallery here, and the other way round.
for (const p of projects) {
  if (!projectStories.some((s) => s.id === p.slug)) throw new Error(`No gallery for project ${p.slug}`);
}

export const photoCount = projectStories.reduce((n, s) => n + s.photos.length, 0);
