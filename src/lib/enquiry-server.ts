import { company } from "@content/company";
import type { EnquiryInput } from "./enquiry";

// Server side of the forms: where requests are stored (Supabase) and who is
// told about them (an email through Resend). Every setting comes from the
// environment, so nothing is sent anywhere until the keys are added on Vercel.
// See docs/forms.md.

const env = (name: string) => process.env[name]?.trim() || "";

export function enquiryConfig() {
  return {
    supabaseUrl: env("SUPABASE_URL").replace(/\/$/, ""),
    supabaseKey: env("SUPABASE_PUBLISHABLE_KEY") || env("SUPABASE_ANON_KEY"),
    resendKey: env("RESEND_API_KEY"),
    resendUrl: env("RESEND_API_URL") || "https://api.resend.com/emails",
    alertTo: env("ENQUIRY_ALERT_TO"),
    alertFrom: env("ENQUIRY_ALERT_FROM") || "SWEILLEM website <onboarding@resend.dev>",
  };
}

/** True once requests can be stored. Pages read this at build time to show or hide the "not switched on yet" note. */
export function formsEnabled() {
  const c = enquiryConfig();
  return Boolean(c.supabaseUrl && c.supabaseKey);
}

/** Store one request. Visitors' key may only insert (Row Level Security), never read. */
export async function storeEnquiry(e: EnquiryInput, id: string, meta: { page: string }) {
  const c = enquiryConfig();
  const common = { id, name: e.name, email: e.email, phone: e.phone || null, company: e.company || null, page: meta.page || null };
  const [table, row] =
    e.kind === "quote"
      ? ["quote_requests", { ...common, country: e.country, project: e.project || null, message: e.message || null, items: e.items }]
      : ["contact_messages", { ...common, topic: e.topic || null, message: e.message }];

  const headers: Record<string, string> = {
    apikey: c.supabaseKey,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
  // Legacy anon keys are JWTs and go in Authorization too; new sb_publishable_ keys must not.
  if (c.supabaseKey.startsWith("eyJ")) headers.Authorization = `Bearer ${c.supabaseKey}`;

  const res = await fetch(`${c.supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(row),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Supabase insert into ${table} failed: ${res.status} ${await res.text().catch(() => "")}`.slice(0, 500));
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export function alertEmail(e: EnquiryInput, reference: string) {
  const who = [e.name, e.company].filter(Boolean).join(", ");
  const subject = e.kind === "quote" ? `Quote request ${reference} from ${who}` : `Website message ${reference} from ${who}${e.topic ? ` (${e.topic})` : ""}`;
  const lines: [string, string][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Phone", e.phone],
    ["Company", e.company],
    ...(e.kind === "quote"
      ? ([
          ["Country", e.country],
          ["Project", e.project],
        ] as [string, string][])
      : ([["Topic", e.topic]] as [string, string][])),
  ];
  const items = e.items.map((i) => `${i.qty} × ${i.product}, ${i.size}${i.strengthClass ? `, ${i.strengthClass}` : ""}`);

  const text = [
    `${e.kind === "quote" ? "New quote request" : "New message"} from the ${company.shortName} website. Reference ${reference}.`,
    "",
    ...lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    ...(items.length ? ["", "Items:", ...items.map((i) => `- ${i}`)] : []),
    ...(e.message ? ["", "Message:", e.message] : []),
    "",
    "Reply to this email to answer the sender directly.",
  ].join("\n");

  // Light and dark: the colour-scheme meta tells mail apps both are supported, and
  // the media query swaps the colours in apps that read <style> (Apple Mail, iOS).
  // Gmail ignores both and adjusts the colours itself.
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<style>:root{color-scheme:light dark}@media (prefers-color-scheme:dark){.sw-body{background:#141011!important;color:#f1ebe8!important}.sw-muted{color:#aaa19d!important}}</style></head>
<body class="sw-body" style="margin:0;padding:16px;background:#ffffff;color:#1c1818"><div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5">
<p>${e.kind === "quote" ? "New quote request" : "New message"} from the ${company.shortName} website. Reference <strong>${reference}</strong>.</p>
<table style="border-collapse:collapse">${lines
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td class="sw-muted" style="padding:2px 16px 2px 0;color:#5d5f62">${k}</td><td>${escapeHtml(v)}</td></tr>`)
    .join("")}</table>
${items.length ? `<p style="margin-top:16px"><strong>Items</strong></p><ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : ""}
${e.message ? `<p style="margin-top:16px"><strong>Message</strong></p><p style="white-space:pre-wrap">${escapeHtml(e.message)}</p>` : ""}
<p class="sw-muted" style="color:#5d5f62;margin-top:20px">Reply to this email to answer the sender directly.</p></div></body></html>`;

  return { subject, text, html };
}

/** Email the alert inbox. Skipped (returns false) until RESEND_API_KEY and ENQUIRY_ALERT_TO are set. */
export async function sendAlert(e: EnquiryInput, reference: string) {
  const c = enquiryConfig();
  if (!c.resendKey || !c.alertTo) return false;
  const { subject, text, html } = alertEmail(e, reference);
  const res = await fetch(c.resendUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: c.alertFrom,
      to: c.alertTo.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: e.email,
      subject,
      text,
      html,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Alert email failed: ${res.status} ${await res.text().catch(() => "")}`.slice(0, 500));
  return true;
}
