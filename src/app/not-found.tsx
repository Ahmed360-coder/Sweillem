import { ButtonLink } from "@/components/Button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="wrap grid justify-items-center gap-6 py-[clamp(48px,8vw,104px)] text-center">
      <svg viewBox="0 0 240 150" className="w-[min(320px,80vw)] overflow-visible" aria-hidden="true">
        <line x1="0" y1="112" x2="240" y2="112" stroke="var(--line)" strokeWidth="2" />
        <g className="nf-pipe" style={{ transformOrigin: "120px 72px", transformBox: "view-box" }}>
          <circle cx="120" cy="72" r="40" fill="var(--glaze)" />
          <circle cx="120" cy="72" r="28" fill="var(--bore)" />
          <circle cx="120" cy="72" r="40" fill="none" stroke="var(--glaze-hi)" strokeWidth="3" strokeDasharray="30 220" />
        </g>
        <path className="nf-drop" d="M120 104c-3 5-5 8-5 11a5 5 0 0 0 10 0c0-3-2-6-5-11z" fill="var(--slate)" />
      </svg>
      <p className="eyebrow">Error 404</p>
      <h1 id="nf-title" className="text-[clamp(30px,4.4vw,52px)]">
        This pipe doesn’t connect to anything
      </h1>
      <p className="lede">The page you asked for isn’t here. It may have moved when the site was rebuilt.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" arrow>
          Home page
        </ButtonLink>
        <ButtonLink href="/products" variant="ghost">
          Find a product
        </ButtonLink>
      </div>
    </section>
  );
}
