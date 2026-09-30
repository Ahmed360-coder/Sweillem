import { BuildNote } from "./BuildNote";
import { PageHeader } from "./PageHeader";
import { pageMetadata } from "@/lib/metadata";
import { stubPages, type StubKey } from "@/lib/pages";

export function stubMetadata(key: StubKey) {
  const p = stubPages[key];
  return pageMetadata({ title: p.title, description: p.description, path: p.path });
}

/** A page whose layout is final and whose full content lands in a later milestone. */
export function StubRoute({ page }: { page: StubKey }) {
  const p = stubPages[page];
  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} lede={p.lede} />
      <BuildNote milestone={p.milestone}>
        <p>{p.coming}</p>
      </BuildNote>
    </>
  );
}
