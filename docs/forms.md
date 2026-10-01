# Quote and contact forms

`/quote` (the quote list) and `/contact` post to `/api/enquiry`
(`src/app/api/enquiry/route.ts`). The handler checks the request again,
stores it in Supabase and emails an alert through Resend.

## Switching them on

1. **Database.** In a Supabase project, run
   `supabase/migrations/20261001150000_enquiries.sql` (SQL editor, or
   `supabase db push`). It creates `quote_requests` and `contact_messages`
   with Row Level Security: the website's public key can only insert. Nobody
   can read rows with it; read them in the Supabase dashboard (Table editor).
2. **Vercel environment variables** (Project → Settings → Environment
   Variables, for Production and Preview):

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | Project URL, e.g. `https://abcd.supabase.co` |
   | `SUPABASE_PUBLISHABLE_KEY` | The `sb_publishable_…` key (a legacy `anon` key also works, as `SUPABASE_ANON_KEY`) |
   | `RESEND_API_KEY` | From resend.com → API Keys |
   | `ENQUIRY_ALERT_TO` | Inbox for alerts; several addresses separated by commas |
   | `ENQUIRY_ALERT_FROM` | Optional. Defaults to `SWEILLEM website <onboarding@resend.dev>`, which Resend only delivers to the Resend account's own address. To send to anyone else, verify a domain in Resend and use e.g. `SWEILLEM website <website@sweillem.net>` |

3. **Redeploy.** The pages read whether the database is set at build time,
   so redeploy after adding the keys.

Without the database keys the forms still check every field, say plainly that
online sending is not switched on, and offer to open the same request in the
visitor's email app, addressed to info@sweillem.net. Without the Resend keys,
requests are stored but no alert is sent.

## Spam protection

- A hidden honeypot field (`website`): posts that fill it are answered as if
  sent and dropped.
- A minimum of 2.5 seconds between the form appearing and being sent.
- Five requests per address per ten minutes, per server instance.
- Length limits on every field, checked in the browser, in the handler and
  by the database.

## Testing without sending real email

Point the handler at a stand-in server: `RESEND_API_URL` overrides the Resend
endpoint, and `SUPABASE_URL` can be any server that accepts
`POST /rest/v1/<table>`. Never test with `ENQUIRY_ALERT_TO` set to a
SWEILLEM address.
