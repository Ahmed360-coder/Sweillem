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
    "SWEILLEM clay roof tiles in terracotta, blue and black. Switch colours in the viewer and follow a tile from Aswan clay to the 1200 °C kiln.",
  path: "/roof-tiles",
});

// Step text comes from SWEILLEM's published clay process (content/company.ts,
// About and the company deck). Roof-tile specifics are asked in docs/content-gaps.md 8.2.
const steps: TileStep[] = [
  {
    id: "quarry",
    title: "Collecting the clay",
    text: "The clay begins its journey from the quarry of Aswan, where it is dug and loaded for the trip to the factory.",
  },
  {
    id: "checks",
    title: "Inspection and storage",
    text: "On arrival the raw material is inspected and carefully stored. Quality checks cover the share of fine minerals, the share of salts and the aluminium oxide (Al₂O₃) in the clay.",
  },
  {
    id: "moulding",
    title: "Moulding",
    text: "The wet clay is kept in the right atmosphere until it is moulded into shape, then carried on to the dryers in perfect condition.",
  },
  {
    id: "drying",
    title: "Drying",
    text: "Drying takes out most of the water the moulding needed. The dryers were built under the supervision of the German company Lingl, and their control is fully computerised.",
  },
  {
    id: "colour",
    title: "Colour and glaze",
    text: "After quality control the dried clay gets its finish. SWEILLEM offers its tiles in terracotta, blue and black.",
  },
  {
    id: "firing",
    title: "Firing",
    text: "Shuttle kilns follow the best firing curve up to a maximum of 1200 degrees, over two to four days. The fire turns soft clay into hard ceramic.",
    fact: "Up to 1200 °C · 2 to 4 days",
  },
  {
    id: "packing",
    title: "Quality control and packing",
    text: "Finished tiles are checked and stacked for dispatch. Every tile is stamped “Made in Egypt” and “SWEILLEM”.",
  },
  {
    id: "delivery",
    title: "Delivery",
    text: "Efficiency, accuracy, delivery on time: the tiles travel from the factory to the building site.",
  },
  {
    id: "roof",
    title: "On the roof",
    text: "Row by row, from the eaves to the ridge, the tiles close the roof. This last scene is an illustration.",
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

      <section id="how-its-made" aria-labelledby="how-its-made-title" className="pt-[clamp(48px,7vw,96px)]">
        <div className="wrap mb-8 grid gap-3">
          <p className="eyebrow">How a tile is made</p>
          <h2 id="how-its-made-title" className="text-[clamp(26px,3.4vw,42px)]">
            From the Aswan quarry to the roof
          </h2>
          <p className="lede">Scroll to follow a tile through nine steps. The explanation for each step sits under the picture.</p>
        </div>
        <TileJourney steps={steps} />
        <div className="wrap pt-8">
          <SourceNote>
            Steps from SWEILLEM’s published manufacturing process (About and the company deck), which SWEILLEM describes for its clay
            products. Before firing the tile is
            drawn; the photo of the finished tile appears from packing onwards, and the roof scene is an illustration. See the{" "}
            <Link href="/process" className="link">
              pipe journey
            </Link>{" "}
            for the full story.
          </SourceNote>
        </div>
      </section>

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
