import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { RoofTileViewer } from "@/components/RoofTileViewer";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { TileJourney, type TileStep } from "@/components/TileJourney";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Clay roof tiles in terracotta, blue and black",
  description:
    "SWEILLEM clay roof tiles, made in Egypt, in terracotta, blue and black. Switch colours in the viewer and see how a tile is made, from Aswan clay to the 1200 °C kiln.",
  path: "/roof-tiles",
});

// Step text comes from SWEILLEM's published clay process (content/company.ts,
// About and the company deck). Roof-tile specifics are asked in docs/content-gaps.md 8.2.
const steps: TileStep[] = [
  {
    id: "clay",
    title: "Clay from Aswan",
    text: "The clay begins its journey from the quarry of Aswan. At the factory it is inspected and stored, and checked for its share of fine minerals, salts and aluminium oxide.",
  },
  {
    id: "moulding",
    title: "Moulding",
    text: "The wet clay is kept in the right atmosphere until it is moulded, then carried on to the dryers in perfect condition.",
  },
  {
    id: "drying",
    title: "Drying",
    text: "Drying takes out most of the water the moulding needed. The dryers were built under the supervision of the German company Lingl, and their control is fully computerised.",
  },
  {
    id: "colour",
    title: "Colour and glaze",
    text: "After quality control, the clay gets its finish. SWEILLEM offers its tiles in terracotta, blue and black.",
  },
  {
    id: "firing",
    title: "Firing",
    text: "SWEILLEM fires in shuttle kilns that follow the best firing curve up to a maximum of 1200 degrees, over two to four days. The fire turns soft clay into hard ceramic.",
    fact: "Up to 1200 °C · 2 to 4 days",
  },
  {
    id: "ready",
    title: "Ready for the roof",
    text: "Every tile is stamped “Made in Egypt” and “SWEILLEM” and leaves the factory ready to lay.",
  },
];

export default function RoofTilesPage() {
  return (
    <>
      <PageHeader
        eyebrow="New product line"
        title="Clay roof tiles"
        lede="SWEILLEM’s second product line, made in Egypt. Roof tiles come in various designs, colours and profiles. Pick a colour to see it up close or across a roof."
      />
      <div className="wrap py-10">
        <RoofTileViewer />
      </div>

      <Section
        id="how-its-made"
        eyebrow="How a tile is made"
        title="From Aswan clay to a finished tile"
        lede="Scroll through the six steps. Each one follows SWEILLEM’s published clay process."
      >
        <TileJourney steps={steps} />
        <SourceNote className="mt-10">
          Steps from SWEILLEM’s published manufacturing process (About and the company deck), which SWEILLEM describes for its clay
          products. The tile-specific details, such as how each colour is applied, are being confirmed with SWEILLEM. See the{" "}
          <Link href="/process" className="link">
            pipe journey
          </Link>{" "}
          for the full story.
        </SourceNote>
      </Section>

      <Section id="details" eyebrow="Specifications" title="Sizes and standards to follow">
        <div className="grid gap-4 rounded-card border border-dashed border-line bg-surface p-[clamp(20px,3vw,32px)] md:grid-cols-[1fr_auto] md:items-center">
          <p className="max-w-[62ch] text-muted">
            SWEILLEM has not published tile models, sizes, weights, coverage or standards yet. They will be added here as soon as they
            are. Until then, ask SWEILLEM directly and say which colour and how many square metres you need.
          </p>
        </div>
      </Section>
      <CtaBand title="Roofing a building?" text="Tell SWEILLEM the colour, the roof area and where the tiles are going." />
    </>
  );
}
