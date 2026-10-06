// What the Sweillem chat panel and /api/assistant send each other. Shared by
// the browser and the server, so it holds no secrets and no server imports.

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface AssistantRequest {
  /** The conversation so far, oldest first, ending with the visitor's new question. */
  messages: ChatTurn[];
  /** The page the visitor is on, e.g. "/products/pipes". */
  page?: string;
  /** What is on their quote list right now. */
  quote?: { product: string; size: string; strengthClass?: string; qty: number }[];
}

/** One line of the streamed answer (newline-delimited JSON). */
export type AssistantEvent =
  | { type: "text"; text: string }
  | { type: "quote"; item: { product: string; size: string; strengthClass?: string }; qty: number }
  | { type: "done" }
  | { type: "error"; error: AssistantError };

export type AssistantError = "not-configured" | "invalid" | "too-long" | "rate-limited" | "busy" | "refused" | "failed";

export const assistantLimits = {
  /** Longest question a visitor can send. */
  questionChars: 600,
  /** Earlier turns sent with each question; older ones are dropped. */
  turns: 12,
  /** Longest earlier answer kept in the history. */
  answerChars: 4000,
} as const;
