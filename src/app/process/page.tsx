import { CtaBand } from "@/components/CtaBand";
import { FilmPlayer } from "@/components/FilmPlayer";
import { PageHeader } from "@/components/PageHeader";
import { ProcessJourney, type ProcessStep } from "@/components/ProcessJourney";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { pageMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";

export const metadata = pageMetadata({
  title: "How vitrified clay pipes are made",
  description:
    "How SWEILLEM makes vitrified clay pipes: Aswan clay, extrusion, Lingl dryers, full glazing and firing in shuttle kilns at up to 1200 °C over 2 to 4 days.",
  path: "/process",
});

// The six steps named on About Us, plus delivery. Text from SWEILLEM's 2024
// report and deck (content/company.ts facts raw-material to firing) and the
// Joint Performance page.
const steps: ProcessStep[] = [
  {
    title: "Raw material",
    text: "The clay begins its journey at the quarry in Aswan. On arrival at the factory it is inspected and carefully stored.",
    facts: ["Aswan clay", "Fine minerals checked", "Salts checked", "Al₂O₃ checked"],
    image: { src: "/images/process/raw.webp", alt: "Raw clay on a conveyor belt in the factory" },
  },
  {
    title: "Moulding",
    text: "Wet clay is kept in the most suitable atmosphere until it reaches the extruders that mould each pipe. Specialised handling equipment carries the pipes on to the dryers in perfect condition.",
    facts: ["Extruders", "Specialised handling"],
    image: { src: "/images/process/moulding.webp", alt: "Freshly moulded clay pipes at the extruder" },
  },
  {
    title: "Drying",
    text: "The pipes lose most of the water that moulding needed. The dryers were built under the supervision of the German company Lingl, and their control is fully computerised.",
    facts: ["Lingl, Germany", "Computer controlled"],
    image: { src: "/images/process/drying.webp", alt: "Rows of clay pipes standing on a car for drying" },
  },
  {
    title: "Glazing",
    text: "After drying and a quality check, each pipe is fully immersed in glaze, a thick liquid of natural materials. Firing turns it into a glassy cover inside and out, which keeps internal friction low and stops the inner surface absorbing.",
    facts: ["Full immersion", "Glazed inside and out"],
    image: { src: "/images/process/glazing.webp", alt: "Clay pipes held over the glazing tank" },
  },
  {
    title: "Firing",
    text: "A pre-heating phase makes sure no humidity is left in the pipes. Shuttle kilns from a leading German American maker then fire each diameter on its own curve, up to a maximum of 1200 °C, over 2 to 4 days.",
    facts: ["Shuttle kilns", "Up to 1200 °C", "2 to 4 days"],
    image: { src: "/images/site/glazed.webp", alt: "Fired, glazed pipes standing in the plant" },
    kiln: true,
  },
  {
    title: "Jointing",
    text: "Spigot and socket are designed to seal watertight at 0.5, 1 and 2.4 bar, internal or external. A polyurethane joint of 67 ± 5 Shore A keeps roots out.",
    facts: ["Polyurethane joint", "0.5, 1 and 2.4 bar", "EN 295-3:2012"],
    image: {
      src: "/images/quality/joint-water-tightness.png",
      alt: "Cross-section drawing of a spigot sealed inside a socket by a polyurethane ring",
      contain: true,
    },
    link: { href: "/joint-performance", label: "How the joints are tested" },
  },
  {
    title: "Delivery",
    text: "Shortest delivery time is one of SWEILLEM’s main objectives. Pipes go to projects from the factory, or from warehouses abroad such as the Euro Sweillem central stock in Germany.",
    facts: ["Egypt", "Saudi Arabia", "Germany"],
    image: { src: "/images/process/truck.webp", alt: "A truck loaded with SWEILLEM pipes" },
    link: { href: "/euro-sweillem", label: "About Euro Sweillem" },
    after: "Then",
  },
];

const videoJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "How a SWEILLEM clay pipe is made",
  description: "An animated film following one vitrified clay pipe from the Aswan quarry through the kiln to a sewer line.",
  thumbnailUrl: `${siteUrl}/video/how-its-made-poster.png`,
  contentUrl: `${siteUrl}/video/how-its-made.mp4`,
  uploadDate: "2026-09-30",
  duration: "PT1M45S",
};

export default function ProcessPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
      <PageHeader
        eyebrow="Manufacturing process"
        title="Six steps from Aswan clay to a finished joint"
        lede="Every SWEILLEM pipe is moulded, dried, glazed inside and out, and fired at up to 1200 °C. Watch the film, then scroll through each step."
      />

      <section aria-label="How it’s made film" className="py-[clamp(24px,4vw,48px)]">
        <div className="wrap">
          <FilmPlayer />
        </div>
      </section>

      <Section id="steps" title="Step by step">
        <ProcessJourney steps={steps} />
        <SourceNote className="mt-8">
          Sources: SWEILLEM’s 2024 company report and deck, and the Joint Performance page on sweillem.net.
        </SourceNote>
      </Section>

      <CtaBand />
    </>
  );
}
