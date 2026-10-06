"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { assistantLimits, type AssistantError, type AssistantEvent, type ChatTurn } from "@/lib/assistant/protocol";
import { addToQuote, useQuote } from "@/lib/quote";

/**
 * Sweillem, the site's assistant: a floating button on every page that opens a
 * chat panel. Answers come from /api/assistant, which only uses the site's own
 * pages, and can add lines to the visitor's quote list. The conversation is
 * kept for the browser tab (sessionStorage), so it survives moving between pages.
 */

interface Added {
  label: string;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  added?: Added[];
  error?: AssistantError;
}

const STORE = "sweillem.assistant.v1";
const MAX_KEPT = 40;

const suggestions = [
  "What is the difference between N and H class pipes?",
  "Which pipe sizes do you make?",
  "Add 20 DN 300 H class pipes to my quote",
  "ما هي المنتجات التي تصنعونها؟",
];

const errorText: Record<AssistantError, string> = {
  "not-configured": "Sweillem is not switched on yet. Meanwhile you can [contact SWEILLEM](/contact) or build a [quote list](/quote).",
  "rate-limited": "You have asked a lot in a short time. Please try again a little later, or [contact SWEILLEM](/contact).",
  busy: "Sweillem is busy right now. Please try again in a moment.",
  "too-long": `That question is too long. Please keep it under ${assistantLimits.questionChars} characters.`,
  refused: "Sorry, I can’t help with that. I can answer questions about SWEILLEM’s products, projects and quotes.",
  invalid: "Sorry, something went wrong. Please try again, or [contact SWEILLEM](/contact).",
  failed: "Sorry, something went wrong. Please try again, or [contact SWEILLEM](/contact).",
};

function loadMessages(): Message[] {
  try {
    const raw = window.sessionStorage.getItem(STORE);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Message[]).filter((m) => m && (m.role === "user" || m.role === "assistant")) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]) {
  try {
    window.sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-MAX_KEPT)));
  } catch {
    // Storage blocked: the chat lasts until the page reloads.
  }
}

/** **bold** and [text](href) inside one line. Only site paths, email and phone links become links. */
function inline(text: string, onNavigate: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={m.index}>{m[1]}</strong>);
    else {
      const [label, href] = [m[2], m[3]];
      if (href.startsWith("/") && !href.startsWith("//"))
        out.push(
          <Link key={m.index} href={href} onClick={onNavigate} className="font-medium text-maroon underline underline-offset-2">
            {label}
          </Link>,
        );
      else if (/^(mailto:|tel:)/.test(href))
        out.push(
          <a key={m.index} href={href} className="font-medium text-maroon underline underline-offset-2">
            {label}
          </a>,
        );
      else out.push(label);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Paragraphs and "- " lists, the only block formatting the assistant uses. */
function Rich({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim());
        const items = lines.filter((l) => /^\s*[-*•]\s+/.test(l));
        if (items.length && items.length === lines.length)
          return (
            <ul key={bi} className="grid list-disc gap-1 ps-5">
              {items.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-*•]\s+/, ""), onNavigate)}</li>
              ))}
            </ul>
          );
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""), onNavigate)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

/** The S mark from the SWEILLEM logo (components/Logo.tsx). */
const S_MARK =
  "M73.89 30.66L121.81 60.75L121.81 93.28L73.89 63.19L50.33 77.98L121.50 122.68L140.07 111.02L146.86 106.75L146.86 46.90L73.89 1.07L0.92 46.90L0.92 78.19L0.92 107.78L25.98 123.51L73.89 153.60L97.45 138.81L25.98 93.93L25.98 60.75ZM73.89 185.97L0.92 140.14L0.92 169.73L73.89 215.56L146.86 169.73L146.86 140.14L121.81 155.88L121.81 155.88L73.89 185.97Z";

/** The S mark from the SWEILLEM logo. */
function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 148 217" aria-hidden="true" className={className}>
      <path fill="currentColor" d={S_MARK} />
    </svg>
  );
}

/** The floating button's face: the S mark from the logo, white on a maroon hexagon of the same outline. */
function SButton({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-14 -14 176 245" aria-hidden="true" className={className}>
      <polygon
        points="73.89,1 146.86,46.9 146.86,169.73 73.89,215.56 0.92,169.73 0.92,46.9"
        className="fill-brand stroke-brand transition-colors group-hover/ask:fill-brand-hi group-hover/ask:stroke-brand-hi"
        strokeWidth={22}
        strokeLinejoin="round"
      />
      <g transform="translate(73.89 108.3) scale(0.6) translate(-73.89 -108.3)" className="fill-on-brand">
        <path d={S_MARK} />
      </g>
    </svg>
  );
}

const quoteLabel = (item: { product: string; size: string; strengthClass?: string }, qty: number) =>
  `${qty} × ${item.product}, ${item.size}${item.strengthClass && !item.product.includes(`${item.strengthClass} class`) ? `, ${item.strengthClass} class` : ""}`;

export function Assistant() {
  const pathname = usePathname();
  const quote = useQuote();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [announce, setAnnounce] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loaded = useRef(false);

  const openPanel = () => {
    // The conversation so far in this tab, read when first needed.
    if (!loaded.current) {
      loaded.current = true;
      setMessages(loadMessages());
    }
    setOpen(true);
  };

  // Ask once whether the chat is switched on, the first time the panel opens.
  useEffect(() => {
    if (!open || enabled !== null) return;
    fetch("/api/assistant", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(true));
  }, [open, enabled]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("#site-menu[data-open]")) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Follow the answer as it streams in, unless the visitor has scrolled up to read.
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    if (log.scrollHeight - log.scrollTop - log.clientHeight < 120) log.scrollTop = log.scrollHeight;
  }, [messages, open]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus({ preventScroll: true }));
  }, []);

  /** Following a link on a phone closes the panel so the page can be seen. */
  const onNavigate = useCallback(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  }, []);

  const update = (fn: (m: Message[]) => Message[]) =>
    setMessages((prev) => {
      const next = fn(prev);
      saveMessages(next);
      return next;
    });

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    if (question.length > assistantLimits.questionChars) {
      update((m) => [...m, { role: "user", text: question }, { role: "assistant", text: "", error: "too-long" }]);
      return;
    }
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "";
    const history: ChatTurn[] = [...messages.filter((m) => m.text && !m.error).map(({ role, text }) => ({ role, text })), { role: "user", text: question }];
    update((m) => [...m, { role: "user", text: question }, { role: "assistant", text: "" }]);
    setBusy(true);
    setAnnounce("Sweillem is answering");

    const patchLast = (fn: (m: Message) => Message) => update((all) => [...all.slice(0, -1), fn(all.at(-1)!)]);
    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, page: pathname, quote }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = ((await res.json().catch(() => null)) as AssistantEvent | null) ?? null;
        const code = err?.type === "error" ? err.error : "failed";
        if (code === "not-configured") setEnabled(false);
        patchLast((m) => ({ ...m, error: code }));
        setAnnounce(errorText[code].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as AssistantEvent;
          if (event.type === "text") {
            answer += event.text;
            const shown = answer.replace(/^\s+/, "");
            patchLast((m) => ({ ...m, text: shown }));
          } else if (event.type === "quote") {
            addToQuote(event.item, event.qty);
            patchLast((m) => ({ ...m, added: [...(m.added ?? []), { label: quoteLabel(event.item, event.qty) }] }));
          } else if (event.type === "error") {
            patchLast((m) => ({ ...m, error: event.error }));
          }
        }
      }
      setAnnounce(answer.trim() ? `Sweillem: ${answer.trim().replace(/\*\*|\[|\]\([^)]+\)/g, "")}` : "");
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error(err);
        patchLast((m) => ({ ...m, error: "failed" }));
        setAnnounce(errorText.failed.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  const stop = () => abortRef.current?.abort();
  const newChat = () => {
    stop();
    update(() => []);
    inputRef.current?.focus();
  };

  const off = enabled === false;
  const empty = messages.length === 0;

  return (
    <div className="assistant no-print" data-swipe-ignore="">
      <button
        ref={buttonRef}
        type="button"
        onClick={openPanel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        data-open={open ? "" : undefined}
        className="assistant-button group/ask fixed end-4 z-40 flex cursor-pointer items-center gap-2.5 transition-[transform,opacity] duration-300 ease-glaze active:translate-y-px data-open:pointer-events-none data-open:scale-75 data-open:opacity-0 sm:end-6"
      >
        <span className="hidden rounded-full border border-line bg-surface px-4 py-2 text-[15px] font-semibold text-ink shadow-card transition-colors group-hover/ask:border-ink sm:block">
          Ask Sweillem
        </span>
        <span className="sr-only sm:hidden">Ask Sweillem</span>
        <SButton className="h-[68px] w-auto drop-shadow-[0_6px_14px_rgb(20_10_8/0.35)] transition-transform duration-200 ease-glaze group-hover/ask:-translate-y-0.5" />
      </button>

      <div
        ref={panelRef}
        id={`${uid}-panel`}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${uid}-title`}
        inert={!open}
        data-open={open ? "" : undefined}
        className="assistant-panel fixed inset-x-0 bottom-0 z-[45] flex h-[min(88dvh,720px)] origin-bottom translate-y-6 scale-[.98] flex-col overflow-hidden rounded-t-card border border-line bg-surface text-ink invisible opacity-0 shadow-card transition-[transform,opacity,visibility] duration-300 ease-kiln pointer-events-none data-open:pointer-events-auto data-open:visible data-open:translate-y-0 data-open:scale-100 data-open:opacity-100 motion-reduce:transition-none sm:inset-x-auto sm:end-6 sm:bottom-6 sm:h-[min(640px,calc(100dvh-120px))] sm:w-[400px] sm:origin-bottom-right sm:rounded-card rtl:sm:origin-bottom-left"
      >
        <div className="flex items-center gap-3 border-b border-line bg-brand px-4 py-3 text-on-brand">
          <span className="grid size-10 flex-none place-items-center rounded-full bg-[rgb(255_255_255/0.14)]">
            <Mark className="h-6 w-auto" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={`${uid}-title`} className="font-display text-[17px] leading-tight font-semibold">
              Sweillem
            </h2>
            <p className="text-[13px] leading-tight opacity-85">Answers from this website</p>
          </div>
          {!empty && (
            <button
              type="button"
              onClick={newChat}
              className="min-h-11 cursor-pointer rounded-full px-3 text-[13px] font-medium hover:bg-[rgb(255_255_255/0.12)] active:translate-y-px"
            >
              New chat
            </button>
          )}
          <button
            type="button"
            onClick={close}
            aria-label="Close Sweillem"
            className="relative size-11 flex-none cursor-pointer rounded-full hover:bg-[rgb(255_255_255/0.12)] active:translate-y-px"
          >
            <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-0.5 rotate-45 bg-current" />
            <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-0.5 -rotate-45 bg-current" />
          </button>
        </div>

        <div ref={logRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4" aria-label="Conversation with Sweillem" role="log" aria-live="off">
          {empty ? (
            <div className="grid gap-4">
              <div className="rounded-inner bg-sunk px-4 py-3 text-[15px] leading-relaxed">
                {off ? (
                  <Rich text={errorText["not-configured"]} onNavigate={onNavigate} />
                ) : (
                  <p>
                    Hello, I’m Sweillem. Ask me about SWEILLEM’s pipes, fittings, roof tiles, projects or certificates, or tell me what you need and I’ll add it
                    to your quote list. I only answer from this website.
                  </p>
                )}
              </div>
              {!off && (
                <div className="grid gap-2">
                  <p className="font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">Try asking</p>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      dir="auto"
                      onClick={() => send(s)}
                      className="min-h-11 cursor-pointer rounded-inner border border-line bg-paper px-3 py-2 text-start text-[15px] text-ink transition-colors hover:border-ink active:translate-y-px"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ol className="grid gap-3">
              {messages.map((m, i) => {
                const last = i === messages.length - 1;
                return (
                  <li key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    {m.role === "user" ? (
                      <>
                        <span className="sr-only">You: </span>
                        <p
                          dir="auto"
                          className="max-w-[85%] rounded-inner rounded-ee-sm bg-brand px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-on-brand"
                        >
                          {m.text}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="sr-only">Sweillem: </span>
                        <div dir="auto" className="grid max-w-[92%] gap-2 rounded-inner rounded-es-sm bg-sunk px-3.5 py-2.5 text-[15px] leading-relaxed">
                          {m.text ? <Rich text={m.text} onNavigate={onNavigate} /> : !m.error && busy && last ? <Typing /> : null}
                          {m.added?.map((a, ai) => (
                            <Link
                              key={ai}
                              href="/quote"
                              onClick={onNavigate}
                              className="flex items-start gap-2 rounded-inner border border-ok/40 bg-surface px-3 py-2 text-[14px] text-ink no-underline hover:border-ok"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.4}
                                strokeLinecap="round"
                                aria-hidden="true"
                                className="mt-0.5 size-4 flex-none text-ok"
                              >
                                <path d="m5 12.5 4.5 4.5L19 7.5" />
                              </svg>
                              <span>Added to your quote list: {a.label}</span>
                            </Link>
                          ))}
                          {m.error && <Rich text={errorText[m.error]} onNavigate={onNavigate} />}
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <form
          className="assistant-form border-t border-line bg-surface px-3 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <div className="flex items-end gap-2">
            <label htmlFor={`${uid}-input`} className="sr-only">
              Your question for Sweillem
            </label>
            <textarea
              ref={inputRef}
              id={`${uid}-input`}
              dir="auto"
              rows={1}
              value={draft}
              disabled={off}
              maxLength={assistantLimits.questionChars}
              placeholder={off ? "Not switched on yet" : "Ask Sweillem…"}
              onChange={(e) => {
                setDraft(e.target.value);
                // Grow with the text (field-sizing is not in every Safari yet).
                const el = e.target;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight + 2, 128)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-inner border border-line bg-paper px-3 py-2.5 text-[16px] leading-snug text-ink placeholder:text-muted focus:border-ink focus:outline-none disabled:opacity-60"
            />
            {busy ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop the answer"
                className="grid size-11 flex-none cursor-pointer place-items-center rounded-full border border-line bg-paper text-ink hover:border-ink active:translate-y-px"
              >
                <span aria-hidden="true" className="size-3.5 rounded-[3px] bg-current" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={off || !draft.trim()}
                className="grid size-11 flex-none cursor-pointer place-items-center rounded-full bg-brand text-on-brand transition-colors hover:bg-brand-hi active:translate-y-px disabled:cursor-default disabled:opacity-40"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-5 rtl:-scale-x-100"
                >
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </div>
          <p className="py-2 text-center text-[12px] leading-snug text-muted">
            Sweillem can make mistakes. Check sizes on the product pages; prices come with a quote.
          </p>
        </form>
        <p className="sr-only" role="status">
          {announce}
        </p>
      </div>
    </div>
  );
}

function Typing() {
  return (
    <span className="flex h-6 items-center gap-1" aria-label="Sweillem is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="assistant-dot size-1.5 rounded-full bg-muted" style={{ animationDelay: `${i * 160}ms` }} />
      ))}
    </span>
  );
}
