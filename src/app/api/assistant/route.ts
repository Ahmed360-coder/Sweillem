import Anthropic from "@anthropic-ai/sdk";
import { catalogue, resolveLine } from "@/lib/assistant/catalogue";
import { instructions } from "@/lib/assistant/prompt";
import { assistantLimits, type AssistantError, type AssistantEvent, type AssistantRequest, type ChatTurn } from "@/lib/assistant/protocol";

// The Sweillem assistant. Answers questions from the site's own pages with
// Claude and can add lines to the visitor's quote list (the browser does the
// adding; the visitor sends the list). The API key stays on the server:
// ANTHROPIC_API_KEY on Vercel. Without it the chat says it is not switched on.
// See docs/assistant.md.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
const MAX_TOOL_ROUNDS = 3;

const apiKey = () => process.env.ANTHROPIC_API_KEY?.trim() || "";

/** Whether the chat is switched on, for the panel to show the right greeting. */
export function GET() {
  return Response.json({ enabled: Boolean(apiKey()) }, { headers: { "Cache-Control": "no-store" } });
}

// Per server instance only, like the forms: enough to stop one visitor running up the bill.
const windows = [
  { ms: 10 * 60 * 1000, max: 20 },
  { ms: 24 * 60 * 60 * 1000, max: 80 },
];
const recent = new Map<string, number[]>();

function rateLimited(ip: string, now: number) {
  const longest = windows.at(-1)!.ms;
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < longest);
  const over = windows.some((w) => hits.filter((t) => now - t < w.ms).length >= w.max);
  if (!over) hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return over;
}

const fail = (error: AssistantError, status: number) =>
  Response.json({ type: "error", error } satisfies AssistantEvent, { status, headers: { "Cache-Control": "no-store" } });

/** Checks the request shape and trims the history. Null when it is not usable. */
function parseRequest(raw: unknown): (AssistantRequest & { messages: ChatTurn[] }) | "too-long" | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.messages) || !r.messages.length) return null;
  const messages: ChatTurn[] = [];
  for (const m of r.messages as unknown[]) {
    if (!m || typeof m !== "object") return null;
    const { role, text } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") return null;
    messages.push({ role, text: text.trim() });
  }
  const last = messages.at(-1)!;
  if (last.role !== "user" || !last.text) return null;
  if (last.text.length > assistantLimits.questionChars) return "too-long";

  // Keep the latest turns, starting on a question, with each turn capped.
  let kept = messages.slice(-assistantLimits.turns);
  while (kept[0]?.role !== "user") kept = kept.slice(1);
  kept = kept
    .filter((m) => m.text)
    .map((m) => ({ ...m, text: m.text.slice(0, m.role === "user" ? assistantLimits.questionChars : assistantLimits.answerChars) }));

  const page = typeof r.page === "string" && r.page.startsWith("/") ? r.page.slice(0, 200) : undefined;
  const quote = Array.isArray(r.quote)
    ? (r.quote as unknown[])
        .slice(0, 50)
        .filter((q): q is Record<string, unknown> => !!q && typeof q === "object")
        .map((q) => ({
          product: String(q.product ?? "").slice(0, 120),
          size: String(q.size ?? "").slice(0, 40),
          strengthClass: q.strengthClass ? String(q.strengthClass).slice(0, 10) : undefined,
          qty: Math.max(1, Math.min(100000, Math.floor(Number(q.qty)) || 1)),
        }))
    : [];
  return { messages: kept, page, quote };
}

const addToQuoteTool: Anthropic.Beta.BetaTool = {
  name: "add_to_quote",
  description:
    "Add one product line to the visitor's quote list on their device, or raise its quantity if the line is already there. Use only when the visitor asks for it. They review and send the list themselves at /quote.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["table", "size", "quantity"],
    properties: {
      table: { type: "string", enum: catalogue.map((e) => e.id), description: "Table id from the list in your instructions." },
      size: { type: "string", description: 'A size exactly as listed for that table, e.g. "300" or "300/150", or a roof tile colour.' },
      quantity: { type: "integer", description: "Number of pieces, 1 to 100000." },
    },
  },
};

/** Runs one add_to_quote call: checks it against the published tables and tells the browser to add the line. */
function addToQuote(input: unknown, emit: (e: AssistantEvent) => void): string {
  const { table, size, quantity } = (input ?? {}) as Record<string, unknown>;
  if (typeof table !== "string" || typeof size !== "string") return "Error: table and size are required.";
  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty) || qty < 1 || qty > 100000) return "Error: quantity must be a whole number from 1 to 100000.";
  const resolved = resolveLine(table, size);
  if ("error" in resolved) return `Error: ${resolved.error}`;
  emit({ type: "quote", item: resolved.line, qty });
  const { product, size: s, strengthClass } = resolved.line;
  return `Added ${qty} × ${product}, ${s}${strengthClass ? `, ${strengthClass} class` : ""} to the visitor's quote list. It is not sent yet.`;
}

/** The changing context, sent with the question so the cached instructions stay the same. */
function contextNote(req: AssistantRequest) {
  const lines = [`The visitor is on ${req.page ?? "an unknown page"}.`];
  lines.push(
    req.quote?.length
      ? `Their quote list: ${req.quote.map((q) => `${q.qty} × ${q.product}, ${q.size}${q.strengthClass ? `, ${q.strengthClass} class` : ""}`).join("; ")}.`
      : "Their quote list is empty.",
  );
  return `<context>\n${lines.join("\n")}\n</context>`;
}

export async function POST(req: Request) {
  const key = apiKey();
  if (!key) return fail("not-configured", 503);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("invalid", 400);
  }
  const parsed = parseRequest(raw);
  if (parsed === "too-long") return fail("too-long", 413);
  if (!parsed) return fail("invalid", 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip, Date.now())) return fail("rate-limited", 429);

  const history: Anthropic.Beta.BetaMessageParam[] = parsed.messages.map((m, i, all) =>
    i === all.length - 1
      ? {
          role: "user",
          content: [
            { type: "text", text: contextNote(parsed) },
            { type: "text", text: m.text },
          ],
        }
      : { role: m.role, content: m.text },
  );

  const client = new Anthropic({ apiKey: key, maxRetries: 1, timeout: 50_000 });
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: AssistantEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
      try {
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
          const stream = client.beta.messages.stream(
            {
              model: MODEL,
              max_tokens: 4096,
              output_config: { effort: "low" },
              // If Claude declines on policy grounds, the API retries on its default fallback model.
              betas: ["server-side-fallback-2026-07-01"],
              fallbacks: "default",
              system: [{ type: "text", text: instructions, cache_control: { type: "ephemeral" } }],
              tools: round < MAX_TOOL_ROUNDS ? [addToQuoteTool] : [],
              messages: history,
            },
            { signal: req.signal },
          );
          stream.on("text", (text) => emit({ type: "text", text }));
          const message = await stream.finalMessage();

          if (message.stop_reason === "refusal") {
            emit({ type: "error", error: "refused" });
            break;
          }
          const calls = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
          if (message.stop_reason !== "tool_use" || !calls.length) break;

          history.push({ role: "assistant", content: message.content });
          history.push({
            role: "user",
            content: calls.map((c) => {
              const result = addToQuote(c.input, emit);
              return { type: "tool_result", tool_use_id: c.id, content: result, is_error: result.startsWith("Error") };
            }),
          });
          // Keep the next round's words apart from what came before the tool call.
          emit({ type: "text", text: "\n\n" });
        }
        emit({ type: "done" });
      } catch (err) {
        if (!req.signal.aborted) {
          console.error(err);
          const busy =
            err instanceof Anthropic.RateLimitError ||
            err instanceof Anthropic.InternalServerError ||
            (err instanceof Anthropic.APIError && err.status === 529);
          emit({ type: "error", error: busy ? "busy" : "failed" });
        }
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
