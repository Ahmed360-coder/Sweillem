import type { CSSProperties } from "react";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ProjectsMap } from "@/components/ProjectsMap";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { pageMetadata } from "@/lib/metadata";
import { photoCount, projectStories } from "@/lib/project-galleries";
import { mapData } from "@/lib/projects-map";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "SWEILLEM vitrified clay pipes at work: the Haram central area in Makkah, Sharurah, New Alamein City and sites in Germany, on a map with photos.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Where SWEILLEM pipes are working"
        lede={`Projects in Saudi Arabia, Egypt and Germany, on the map and in ${photoCount} photos from SWEILLEM’s own galleries.`}
      />

      <Section id="map" title="On the map" lede="Pick a project to zoom to it. Switch to Distribution to see SWEILLEM’s addresses and the countries it exports to.">
        <ProjectsMap data={mapData} active variant="page" />
      </Section>

      <Section id="galleries" title="Project photos" lede="Open a photo to see the whole gallery. Each project says what SWEILLEM’s own files tell us about it." className="pt-0">
        <ul className="grid gap-[clamp(28px,4vw,48px)]">
          {projectStories.map((s, i) => (
            <li
              key={s.id}
              id={s.id}
              className="reveal grid scroll-mt-[calc(var(--header-h)_+_16px)] gap-5 border-t border-line pt-[clamp(20px,3vw,32px)] md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-8"
              style={{ "--dl": `${(i % 2) * 80}ms` } as CSSProperties}
            >
              <ProjectGallery title={s.name} photos={s.photos} />
              <div className="grid content-start gap-3">
                <p className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">{s.place}</p>
                <h3 className="text-[clamp(22px,2.6vw,30px)]">{s.name}</h3>
                <ul className="grid gap-2 text-base sm:text-[15px]">
                  {s.facts.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-[.6em] size-1.5 flex-none rotate-45 bg-maroon" />
                      {f}
                    </li>
                  ))}
                </ul>
                <SourceNote>{s.source}</SourceNote>
                {s.onMap && (
                  <a href="#map" className="link tap w-fit text-base sm:text-[15px]">
                    Back to the map
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <section aria-labelledby="more-title" className="pb-[clamp(24px,4vw,48px)]">
        <div className="wrap">
          <div className="grid gap-2 rounded-card border border-dashed border-line p-[clamp(20px,3vw,28px)]">
            <h2 id="more-title" className="text-lg">
              More countries
            </h2>
            <p className="max-w-[70ch] text-base text-muted sm:text-[15px]">
              SWEILLEM also supplies customers in more countries than the projects shown here. See them on the{" "}
              <Link href="/about#reach" className="link">
                export map
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <CtaBand title="Have a project like these?" text="Tell us the sizes, classes and quantities you need, and where the pipes are going." />
    </>
  );
}
