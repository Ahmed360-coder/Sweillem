import { company } from "@content/company";

// Phone numbers in international form, with working tel: links. The numbers
// themselves come from content/company.ts; the landlines are Cairo lines (+20 2).

const digits = (s: string) => s.replace(/\D/g, "");

/** "(+2) 01005382615" → "1005382615" (national number without the leading 0). */
const mobileNational = digits(company.phones[0]).replace(/^2?0/, "");

export const mobile = {
  display: `+20 ${mobileNational.slice(0, 3)} ${mobileNational.slice(3, 6)} ${mobileNational.slice(6)}`,
  href: `tel:+20${mobileNational}`,
};

/** Cairo landlines, e.g. "42274480" → tel:+20242274480. */
export const landlines = company.phones.slice(1).map((n) => {
  const d = digits(n);
  return { display: `+20 2 ${d.slice(0, 4)} ${d.slice(4)}`, href: `tel:+202${d}`, last2: d.slice(-2) };
});

/** "+20 2 4227 4480 / 81 / 82" */
export const landlinesDisplay = landlines.length
  ? [landlines[0].display, ...landlines.slice(1).map((l) => l.last2)].join(" / ")
  : "";

// TODO(factory): confirm that +20 100 538 2615 is on WhatsApp before launch.
export const whatsapp = {
  href: `https://wa.me/20${mobileNational}`,
  label: "WhatsApp",
};
