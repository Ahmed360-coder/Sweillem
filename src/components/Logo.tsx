import Image from "next/image";

// Raster logo from SWEILLEM's deck (transparent WebP). Swap for the vector
// file when SWEILLEM sends it (docs/content-gaps.md 6.1).
export function Logo({ priority = false, white = false }: { priority?: boolean; white?: boolean }) {
  return (
    <Image
      src="/images/brand/sweillem-logo.webp"
      alt="SWEILLEM Vitrified Clay Pipes Co."
      width={640}
      height={217}
      priority={priority}
      className={`h-full w-auto transition-[filter] duration-300 ${white ? "brightness-0 invert" : "[filter:var(--logo-filter)]"}`}
    />
  );
}
