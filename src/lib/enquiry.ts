// Shared rules for the quote request and contact forms. The browser uses them
// to show errors next to each field; the /api/enquiry handler runs the same
// checks again before anything is stored.

export type EnquiryKind = "quote" | "contact";

export const contactTopics = [
  "Pipes and fittings",
  "Roof tiles",
  "Certificates and approvals",
  "Delivery and stock",
  "Something else",
] as const;

export interface EnquiryItem {
  product: string;
  size: string;
  strengthClass?: string;
  qty: number;
}

export interface EnquiryInput {
  kind: EnquiryKind;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  project: string;
  topic: string;
  message: string;
  items: EnquiryItem[];
  /** Honeypot: people never see this field, so it stays empty. */
  website: string;
  /** When the form was first shown (ms since epoch), to catch instant bot posts. */
  startedAt: number;
}

export type FieldName = "name" | "email" | "phone" | "company" | "country" | "project" | "topic" | "message" | "items";
export type FieldErrors = Partial<Record<FieldName, string>>;

export const limits = {
  name: 120,
  email: 200,
  phone: 40,
  company: 160,
  country: 80,
  project: 200,
  topic: 60,
  message: 4000,
  items: 80,
  itemText: 120,
  qty: 100000,
} as const;

/** Forms posted sooner than this after they appeared are treated as bots. */
export const MIN_FILL_MS = 2500;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max + 1) : "");

/** Turn untrusted JSON into a clean input object (unknown keys dropped, strings trimmed). */
export function parseEnquiry(raw: unknown): EnquiryInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.kind !== "quote" && r.kind !== "contact") return null;
  const items = Array.isArray(r.items)
    ? r.items.slice(0, limits.items + 1).map((i) => {
        const it = (i ?? {}) as Record<string, unknown>;
        const qty = Number(it.qty);
        return {
          product: str(it.product, limits.itemText),
          size: str(it.size, limits.itemText),
          ...(typeof it.strengthClass === "string" && it.strengthClass.trim() ? { strengthClass: str(it.strengthClass, limits.itemText) } : {}),
          qty: Number.isFinite(qty) ? Math.floor(qty) : 0,
        };
      })
    : [];
  return {
    kind: r.kind,
    name: str(r.name, limits.name),
    email: str(r.email, limits.email),
    phone: str(r.phone, limits.phone),
    company: str(r.company, limits.company),
    country: str(r.country, limits.country),
    project: str(r.project, limits.project),
    topic: str(r.topic, limits.topic),
    message: str(r.message, limits.message),
    items,
    website: typeof r.website === "string" ? r.website : "",
    startedAt: Number(r.startedAt) || 0,
  };
}

/** Field errors in plain words, or an empty object when the request can be sent. */
export function validateEnquiry(e: EnquiryInput): FieldErrors {
  const err: FieldErrors = {};
  const tooLong = (f: Exclude<FieldName, "items">) => {
    if (e[f].length > limits[f]) err[f] = `Please keep this under ${limits[f]} characters.`;
  };

  if (!e.name) err.name = "Please enter your name.";
  if (!e.email) err.email = "Please enter your email address so SWEILLEM can reply.";
  else if (!EMAIL.test(e.email)) err.email = "This email address looks incomplete. Check it has an @ and a domain, like name@company.com.";
  if (e.phone && !/^[+()\d\s.-]{5,}$/.test(e.phone)) err.phone = "Use digits, spaces and + only.";

  if (e.kind === "quote") {
    if (!e.country) err.country = "Please say which country the pipes are for.";
    if (e.items.length === 0 && !e.message) err.message = "Your quote list is empty, so tell SWEILLEM what you need here.";
    if (e.items.length > limits.items) err.items = `A request can hold up to ${limits.items} lines.`;
    else if (e.items.some((i) => !i.product || !i.size || i.product.length > limits.itemText || i.size.length > limits.itemText))
      err.items = "One of the lines in your list could not be read. Remove it and add it again.";
    else if (e.items.some((i) => i.qty < 1 || i.qty > limits.qty)) err.items = `Quantities must be between 1 and ${limits.qty.toLocaleString("en")}.`;
  } else {
    if (!e.message) err.message = "Please write your message.";
    if (e.topic && !(contactTopics as readonly string[]).includes(e.topic)) err.topic = "Please pick a topic from the list.";
  }

  for (const f of ["name", "email", "phone", "company", "country", "project", "topic", "message"] as const) {
    if (!err[f]) tooLong(f);
  }
  return err;
}

/** Answers from /api/enquiry. */
export type EnquiryResponse =
  | { ok: true; reference: string }
  | { ok: false; error: "invalid"; fields: FieldErrors }
  | { ok: false; error: "not-configured" | "rate-limited" | "failed" };
