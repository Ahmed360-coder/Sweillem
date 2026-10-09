import { company } from "@content/company";
import { mobile, whatsapp } from "@/lib/contact";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeSwitch";

/**
 * Slim bar above the header on every page: how to reach SWEILLEM on the left,
 * the Light / Dark switch on the right. It scrolls away; the header below it
 * stays pinned, and the side menu also offers Auto, Light and Dark.
 */
export function TopBar() {
  return (
    <div className="border-b border-line bg-sunk text-[13px] text-muted">
      <div className="wrap flex min-h-11 items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-4">
          <a href={`mailto:${company.email}`} className="truncate text-ink no-underline hover:text-maroon">
            {/* Narrow phones: a short label, so the address is never cut off. */}
            <span className="min-[420px]:hidden">
              Email<span className="sr-only"> {company.email}</span>
            </span>
            <span className="max-[419px]:hidden">{company.email}</span>
          </a>
          <a href={mobile.href} className="hidden whitespace-nowrap text-ink no-underline hover:text-maroon min-[640px]:inline">
            {mobile.display}
          </a>
          <a href={whatsapp.href} target="_blank" rel="noopener" className="whitespace-nowrap text-ink no-underline hover:text-maroon">
            {whatsapp.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <span className="hidden whitespace-nowrap min-[980px]:inline">
            Vitrified clay pipes, made in Egypt since {site.founded}
          </span>
        </p>
        <ThemeToggle className="flex-none" />
      </div>
    </div>
  );
}
