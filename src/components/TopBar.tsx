import { company } from "@content/company";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeSwitch";

const mobile = company.phones[0];
const mobileHref = `tel:+20${mobile.replace(/\D/g, "").replace(/^2?0?/, "")}`;

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
            {company.email}
          </a>
          <a href={mobileHref} className="hidden whitespace-nowrap text-ink no-underline hover:text-maroon min-[640px]:inline">
            {mobile}
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
