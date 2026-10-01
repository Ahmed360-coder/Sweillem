import { ButtonLink } from "./Button";
import { HexIcon } from "./icons";

/** Closing call to action shared by the company pages. */
export function CtaBand({
  title = "Planning a sewer or drainage line?",
  text = "Tell us the sizes, classes and quantities you need, and where the pipes are going.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="py-[clamp(40px,6vw,80px)]">
      <div className="wrap">
        <div className="reveal relative grid gap-6 overflow-hidden rounded-card bg-glaze p-[clamp(24px,5vw,56px)] text-white md:grid-cols-[1fr_auto] md:items-center">
          <HexIcon className="pointer-events-none absolute -end-16 -top-20 size-72 text-white/[.06]" />
          <div className="relative grid gap-3">
            <h2 id="cta-title" className="text-[clamp(24px,3vw,36px)] text-white">
              {title}
            </h2>
            <p className="max-w-[56ch] text-white/80">{text}</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <ButtonLink href="/quote" arrow className="bg-white! text-glaze! hover:bg-white/90!">
              Start a quote list
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" className="border-white/40! bg-transparent! text-white! hover:border-white!">
              Contact SWEILLEM
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
