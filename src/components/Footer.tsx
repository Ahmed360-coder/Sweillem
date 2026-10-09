import Link from "next/link";
import { company } from "@content/company";
import { mobile, whatsapp } from "@/lib/contact";
import { footerNav, site } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";
  return (
    <footer className="mt-10 border-t border-line pt-12 pb-7 text-sm">
      <div className="wrap grid grid-cols-2 gap-7 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" aria-label="SWEILLEM home" className="mb-3.5 block h-11 w-fit py-1">
            <Logo title={null} />
          </Link>
          <p className="max-w-[34ch] text-muted">
            Vitrified clay pipes and fittings for sewer and drainage networks. Cairo, since {site.founded}.
          </p>
          <ul className="mt-4 grid gap-0.5">
            <li>
              <a href={`mailto:${company.email}`} className="inline-flex min-h-11 items-center text-ink no-underline hover:text-maroon md:min-h-0 md:py-1">
                {company.email}
              </a>
            </li>
            <li>
              <a href={mobile.href} className="inline-flex min-h-11 items-center whitespace-nowrap text-ink no-underline hover:text-maroon md:min-h-0 md:py-1">
                {mobile.display}
              </a>
            </li>
            <li>
              <a href={whatsapp.href} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-ink no-underline hover:text-maroon md:min-h-0 md:py-1">
                {whatsapp.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-2.5 font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">
              {group.title}
            </h2>
            <ul className="md:space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 w-fit items-center text-ink no-underline hover:text-maroon md:inline-block md:min-h-0 md:py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-full flex flex-wrap justify-between gap-3 border-t border-line pt-[18px] text-[12.5px] text-muted">
          <span>
            © {new Date().getFullYear()} {site.legalName}
          </span>
          {isPreview && <span>Preview build for review. Not the live site.</span>}
        </div>
      </div>
    </footer>
  );
}
