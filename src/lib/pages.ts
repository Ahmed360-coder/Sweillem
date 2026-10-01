// Page copy for routes whose full content lands in a later milestone.
// Every line here is taken from SWEILLEM's live site, deck or report
// (see content/); nothing is invented. Each milestone replaces its entries
// with the real page and deletes them from this file.

export interface StubPage {
  path: string;
  eyebrow: string;
  title: string;
  lede: string;
  /** Meta description (≤ 160 characters). */
  description: string;
  milestone: number;
  /** What the milestone adds, in plain words. */
  coming: string;
}

export const stubPages = {
  contact: {
    path: "/contact",
    eyebrow: "Contact",
    title: "Talk to SWEILLEM",
    lede: "Ask about pipes, fittings or roof tiles, or send a quote request for your project.",
    description: "Contact SWEILLEM Vitrified Clay Pipes Co. about pipes, fittings, roof tiles and quotations.",
    milestone: 6,
    coming: "A contact form, SWEILLEM’s locations in Egypt, Germany and Saudi Arabia, and the confirmed phone numbers and email address.",
  },
} satisfies Record<string, StubPage>;

export type StubKey = keyof typeof stubPages;
