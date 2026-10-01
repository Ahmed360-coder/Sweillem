import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowIcon } from "./icons";

type Variant = "primary" | "ghost";

const base =
  "group inline-flex min-h-11 items-center justify-center gap-2.5 whitespace-nowrap rounded-full border px-5 py-3 font-semibold no-underline transition-transform duration-200 ease-glaze active:translate-y-px";
const variants: Record<Variant, string> = {
  primary:
    "border-transparent bg-maroon text-on-maroon hover:bg-maroon-hi hover:shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--maroon)_70%,transparent)]",
  ghost: "border-line bg-surface text-ink hover:border-ink",
};

export function ButtonLink({
  variant = "primary",
  arrow = false,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; arrow?: boolean; children: ReactNode }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {arrow && <ArrowIcon className="transition-transform duration-200 ease-glaze group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />}
    </Link>
  );
}
