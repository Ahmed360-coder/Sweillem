"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { company } from "@content/company";
import {
  contactTopics,
  limits,
  validateEnquiry,
  type EnquiryInput,
  type EnquiryKind,
  type EnquiryResponse,
  type FieldErrors,
  type FieldName,
} from "@/lib/enquiry";
import type { QuoteItem } from "@/lib/quote";
import { mobile } from "@/lib/contact";

type Values = Pick<EnquiryInput, "name" | "email" | "phone" | "company" | "country" | "project" | "topic" | "message">;
const blank: Values = { name: "", email: "", phone: "", company: "", country: "", project: "", topic: "", message: "" };

type Problem = "not-configured" | "rate-limited" | "failed" | "offline" | "sent-elsewhere";

const fieldOrder: FieldName[] = ["items", "name", "email", "phone", "company", "country", "project", "topic", "message"];


/** Plain-text version of the request for the "email it instead" link. */
function mailtoHref(kind: EnquiryKind, v: Values, items: QuoteItem[]) {
  const subject = kind === "quote" ? `Quote request${v.company ? ` from ${v.company}` : ""}` : v.topic || "Enquiry from the website";
  const body = [
    ...(items.length ? ["Items:", ...items.map((i) => `- ${i.qty} × ${i.product}, ${i.size}${i.strengthClass ? `, ${i.strengthClass}` : ""}`), ""] : []),
    ...(v.message ? [v.message, ""] : []),
    ...[
      ["Name", v.name],
      ["Phone", v.phone],
      ["Company", v.company],
      ["Country", v.country],
      ["Project", v.project],
    ]
      .filter(([, val]) => val)
      .map(([k, val]) => `${k}: ${val}`),
  ].join("\n");
  return `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, 1800))}`;
}

const inputClass =
  "min-h-12 w-full rounded-inner border border-line bg-paper px-4 text-base text-ink placeholder:text-muted focus-visible:border-ink aria-invalid:border-err aria-invalid:bg-surface";

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
  wide,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`grid content-start gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="flex gap-1.5 text-sm font-medium text-err">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true" className="mt-0.5 size-4 flex-none">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5.5M12 16.5v.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The quote request and contact form. Checks every field in the browser, then
 * posts to /api/enquiry, which checks again and stores the request. Until the
 * database keys are added (`enabled` false), it says so and offers to put the
 * same request into an email instead.
 */
export function EnquiryForm({
  kind,
  enabled: builtEnabled,
  items = [],
  onSent,
}: {
  kind: EnquiryKind;
  enabled: boolean;
  items?: QuoteItem[];
  onSent?: (reference: string, email: string) => void;
}) {
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;
  const [values, setValues] = useState<Values>(blank);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const startedAt = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  // The page is built ahead of time; ask the server whether sending is on now,
  // so adding the keys on Vercel takes effect without rebuilding the page.
  const [liveEnabled, setLiveEnabled] = useState<boolean | null>(null);
  const enabled = liveEnabled ?? builtEnabled;

  useEffect(() => {
    startedAt.current = Date.now();
    let cancelled = false;
    fetch("/api/enquiry", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { enabled?: unknown } | null) => {
        if (!cancelled && typeof d?.enabled === "boolean") setLiveEnabled(d.enabled);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (f: keyof Values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [f]: e.target.value }));
    if (errors[f])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[f];
        return next;
      });
  };

  const describedBy = (f: FieldName, hint = false) =>
    [hint ? `${id(f)}-hint` : "", errors[f] ? `${id(f)}-error` : ""].filter(Boolean).join(" ") || undefined;

  const input = (): EnquiryInput => ({
    kind,
    ...values,
    items: kind === "quote" ? items.map(({ product, size, strengthClass, qty }) => ({ product, size, strengthClass, qty })) : [],
    website: honeypot.current?.value ?? "",
    startedAt: startedAt.current,
  });

  const showErrors = (fields: FieldErrors) => {
    setErrors(fields);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setProblem(null);
    const data = input();
    const fields = validateEnquiry(data);
    if (Object.keys(fields).length) return showErrors(fields);
    setErrors({});

    if (!enabled) {
      setProblem("not-configured");
      requestAnimationFrame(() => problemRef.current?.focus());
      return;
    }

    setSending(true);
    let answer: EnquiryResponse | null = null;
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      answer = (await res.json().catch(() => null)) as EnquiryResponse | null;
    } catch {
      setProblem("offline");
    }
    setSending(false);

    if (answer?.ok) {
      onSent?.(answer.reference, values.email);
      return;
    }
    if (answer && answer.error === "invalid") return showErrors(answer.fields);
    if (answer) setProblem(answer.error);
    else setProblem((p) => p ?? "failed");
    requestAnimationFrame(() => problemRef.current?.focus());
  }

  const errorList = fieldOrder.filter((f) => errors[f]);
  const isQuote = kind === "quote";

  const problemText: Record<Problem, ReactNode> = {
    "not-configured": (
      <>
        <strong>Online {isQuote ? "requests are" : "messages are"} not switched on yet.</strong> Nothing has been sent. Your
        email app can send the same {isQuote ? "request" : "message"} to {company.email} instead.
      </>
    ),
    "rate-limited": (
      <>
        <strong>Several requests have come from your connection in the last few minutes.</strong> Please wait ten minutes and
        send again, or email {company.email}.
      </>
    ),
    failed: (
      <>
        <strong>Your {isQuote ? "request" : "message"} was not sent.</strong> Something went wrong on our side. Everything you
        typed is still here, so please try again, or email it instead.
      </>
    ),
    offline: (
      <>
        <strong>Your {isQuote ? "request" : "message"} was not sent.</strong> The website could not be reached. Check your
        connection and send again; everything you typed is still here.
      </>
    ),
    "sent-elsewhere": null,
  };

  return (
    <form onSubmit={submit} noValidate aria-label={isQuote ? "Quote request" : "Contact form"} className="grid gap-5">
      {!enabled && (
        <p className="rounded-inner border border-dashed border-line bg-sunk/60 px-4 py-3 text-[15px]">
          Online sending is being set up. Until it is, this form puts your {isQuote ? "request" : "message"} into an email to{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>, or you can call{" "}
          <a href={mobile.href} className="whitespace-nowrap">
            {mobile.display}
          </a>
          .
        </p>
      )}

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="grid gap-2 rounded-inner border-2 border-err bg-surface p-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-err">
          <p className="font-semibold">
            {errorList.length === 1 ? "One thing to fix before sending:" : `${errorList.length} things to fix before sending:`}
          </p>
          <ul className="grid gap-1 text-[15px]">
            {errorList.map((f) => (
              <li key={f}>
                <a href={f === "items" ? "#quote-lines" : `#${id(f)}`} className="text-err">
                  {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <Field id={id("name")} label="Your name" error={errors.name}>
          <input id={id("name")} name="name" autoComplete="name" required maxLength={limits.name} value={values.name} onChange={set("name")} aria-invalid={!!errors.name || undefined} aria-describedby={describedBy("name")} className={inputClass} />
        </Field>
        <Field id={id("email")} label="Email" error={errors.email}>
          <input id={id("email")} name="email" type="email" autoComplete="email" inputMode="email" required maxLength={limits.email} value={values.email} onChange={set("email")} aria-invalid={!!errors.email || undefined} aria-describedby={describedBy("email")} className={inputClass} />
        </Field>
        <Field id={id("phone")} label="Phone" optional error={errors.phone}>
          <input id={id("phone")} name="phone" type="tel" autoComplete="tel" maxLength={limits.phone} value={values.phone} onChange={set("phone")} aria-invalid={!!errors.phone || undefined} aria-describedby={describedBy("phone")} className={inputClass} />
        </Field>
        <Field id={id("company")} label="Company" optional error={errors.company}>
          <input id={id("company")} name="company" autoComplete="organization" maxLength={limits.company} value={values.company} onChange={set("company")} aria-invalid={!!errors.company || undefined} aria-describedby={describedBy("company")} className={inputClass} />
        </Field>

        {isQuote ? (
          <>
            <Field id={id("country")} label="Country of the project" error={errors.country}>
              <input id={id("country")} name="country" autoComplete="country-name" required maxLength={limits.country} value={values.country} onChange={set("country")} aria-invalid={!!errors.country || undefined} aria-describedby={describedBy("country")} className={inputClass} />
            </Field>
            <Field id={id("project")} label="Project name" optional error={errors.project}>
              <input id={id("project")} name="project" maxLength={limits.project} value={values.project} onChange={set("project")} aria-invalid={!!errors.project || undefined} aria-describedby={describedBy("project")} className={inputClass} />
            </Field>
          </>
        ) : (
          <Field id={id("topic")} label="What is it about?" optional error={errors.topic} wide>
            <select id={id("topic")} name="topic" value={values.topic} onChange={set("topic")} aria-invalid={!!errors.topic || undefined} aria-describedby={describedBy("topic")} className={`${inputClass} cursor-pointer`}>
              <option value="">Choose a topic</option>
              {contactTopics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        )}

        <Field
          id={id("message")}
          label={isQuote ? "Anything else SWEILLEM should know" : "Your message"}
          optional={isQuote && items.length > 0}
          hint={isQuote ? "For example delivery dates, the site address, joint type or sizes not in the list." : undefined}
          error={errors.message}
          wide
        >
          <textarea id={id("message")} name="message" rows={isQuote ? 4 : 6} maxLength={limits.message} required={!isQuote || items.length === 0} value={values.message} onChange={set("message")} aria-invalid={!!errors.message || undefined} aria-describedby={describedBy("message", isQuote)} className={`${inputClass} min-h-32 resize-y py-3 leading-relaxed`} />
        </Field>
      </div>

      {/* Honeypot: hidden from people and screen readers; bots that fill every field give themselves away. */}
      <div className="hidden">
        <label>
          Website
          <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {problem && problem !== "sent-elsewhere" && (
        <div ref={problemRef} tabIndex={-1} role="alert" className="grid gap-3 rounded-inner border border-warn bg-surface p-4 text-[15px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warn">
          <p>{problemText[problem]}</p>
          {(problem === "not-configured" || problem === "failed" || problem === "rate-limited") && (
            <a
              href={mailtoHref(kind, values, isQuote ? items : [])}
              onClick={() => setProblem("sent-elsewhere")}
              className="inline-flex min-h-11 w-fit items-center rounded-full border border-line bg-surface px-5 font-semibold text-ink no-underline hover:border-ink"
            >
              Open it in my email app
            </a>
          )}
        </div>
      )}
      {problem === "sent-elsewhere" && (
        <p role="status" className="text-[15px] text-muted">
          Your email app should now show the {isQuote ? "request" : "message"}, addressed to {company.email}. Press send there.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full border border-transparent bg-brand px-6 py-3 font-semibold text-on-brand transition-colors duration-200 ease-glaze hover:bg-brand-hi active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {sending && <span className="size-4 animate-spin rounded-full border-2 border-current border-e-transparent" aria-hidden="true" />}
          {sending ? "Sending…" : isQuote ? (enabled ? "Send quote request" : "Prepare quote request") : enabled ? "Send message" : "Prepare message"}
        </button>
        <p className="max-w-[48ch] text-sm text-muted">
          {company.shortName} uses these details only to answer you{isQuote ? " about this request" : ""}.
        </p>
      </div>
      <p className="sr-only" role="status">
        {sending ? "Sending" : ""}
      </p>
    </form>
  );
}
