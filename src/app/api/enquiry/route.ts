import { MIN_FILL_MS, parseEnquiry, validateEnquiry, type EnquiryResponse } from "@/lib/enquiry";
import { formsEnabled, sendAlert, storeEnquiry } from "@/lib/enquiry-server";

// Receives the quote request and contact forms, checks them again, stores them
// in Supabase and emails the alert inbox. Spam protection: a hidden honeypot
// field, a minimum time on the form, and a per-address rate limit.

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Per server instance only; enough to stop one visitor flooding the form.
const recent = new Map<string, number[]>();

function rateLimited(ip: string, now: number) {
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(ip, hits);
    return true;
  }
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return false;
}

const json = (body: EnquiryResponse, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Short reference the visitor can quote back, e.g. "Q-7F3A2C". */
const reference = (kind: "quote" | "contact", id: string) => `${kind === "quote" ? "Q" : "M"}-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

/** Whether online sending is switched on, for forms on pages built before the keys were added. */
export function GET() {
  return Response.json({ enabled: formsEnabled() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, error: "invalid", fields: {} }, 400);
  }
  const input = parseEnquiry(raw);
  if (!input) return json({ ok: false, error: "invalid", fields: {} }, 400);

  const now = Date.now();
  const id = crypto.randomUUID();
  const ref = reference(input.kind, id);

  // Bots fill every field and post at once. Answer as if it worked, store nothing.
  if (input.website || !input.startedAt || now - input.startedAt < MIN_FILL_MS) return json({ ok: true, reference: ref });

  const fields = validateEnquiry(input);
  if (Object.keys(fields).length) return json({ ok: false, error: "invalid", fields }, 422);

  if (!formsEnabled()) return json({ ok: false, error: "not-configured" }, 503);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip, now)) return json({ ok: false, error: "rate-limited" }, 429);

  const page = new URL(req.headers.get("referer") || "http://x/").pathname.slice(0, 200);
  try {
    await storeEnquiry(input, id, { page });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "failed" }, 502);
  }

  // The request is safe in the database; a failed alert must not make the visitor send it twice.
  try {
    await sendAlert(input, ref);
  } catch (err) {
    console.error(err);
  }
  return json({ ok: true, reference: ref });
}
