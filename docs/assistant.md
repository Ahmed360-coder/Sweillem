# Sweillem, the site assistant

A floating S button on every page opens a chat with **Sweillem**. It answers questions about SWEILLEM's products, projects, quality and services, in the visitor's language, and can add lines to the visitor's quote list. The visitor still reviews and sends the list themselves at `/quote`.

## How it works

| Part | Where |
|---|---|
| Button and chat panel | `src/components/Assistant.tsx` (mounted in `src/app/layout.tsx`) |
| Server route (Claude API, streamed answers, quote tool) | `src/app/api/assistant/route.ts` |
| Standing instructions | `src/lib/assistant/prompt.ts` |
| What it knows: the text of every page | `src/lib/assistant/site-text.json` (generated) |
| What it may add to a quote list | `src/lib/assistant/catalogue.ts` (built from the spec tables) |

- It answers only from the site's own pages. When the site does not say something, it says so and points to `/contact`. It never gives prices; it offers to build the quote list instead.
- The model is Claude Opus 5.5 at low effort, with server-side fallback switched on. The instructions and site text are cached by the API, so each question costs little after the first.
- Abuse limits, per visitor address: 20 questions per 10 minutes and 80 per day; questions up to 600 characters; the last 12 turns are sent with each question.
- The conversation lasts for the browser tab (sessionStorage). Nothing is stored on the server.

## Switching it on

Add one environment variable on Vercel (Project → Settings → Environment Variables), for Production and Preview:

- `ANTHROPIC_API_KEY`: a key from https://console.anthropic.com (API Keys). Setting a monthly spend limit there is a good idea.

Then redeploy. Without the key the button still shows, and the panel says Sweillem is not switched on yet, with links to Contact and the quote list.

## When page text changes

The assistant's knowledge is the rendered text of every page in the sitemap. After changing what any page says, run:

```
npm run build && npm run assistant:knowledge
```

and commit `src/lib/assistant/site-text.json`. The e2e test "assistant knowledge matches the pages" fails until you do.

## Testing without a key

The Anthropic SDK honours `ANTHROPIC_BASE_URL`, so `next start` can be pointed at a stand-in server that streams canned answers (Server-Sent Events in the Messages API format) with `ANTHROPIC_API_KEY=test`.
