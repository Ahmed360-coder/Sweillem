-- Quote requests and contact messages from sweillem.net.
-- The website may only INSERT rows. Nobody can read them with the public key:
-- SWEILLEM reads them in the Supabase dashboard (or with the service role key).

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200 and email like '%_@_%'),
  phone text check (char_length(phone) <= 40),
  company text check (char_length(company) <= 160),
  country text not null check (char_length(country) between 1 and 80),
  project text check (char_length(project) <= 200),
  message text check (char_length(message) <= 4000),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 80),
  page text check (char_length(page) <= 200),
  status text not null default 'new' check (status in ('new', 'answered', 'closed'))
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200 and email like '%_@_%'),
  phone text check (char_length(phone) <= 40),
  company text check (char_length(company) <= 160),
  topic text check (char_length(topic) <= 60),
  message text not null check (char_length(message) between 1 and 4000),
  page text check (char_length(page) <= 200),
  status text not null default 'new' check (status in ('new', 'answered', 'closed'))
);

comment on table public.quote_requests is 'Quote list requests sent from sweillem.net. Insert-only for the website.';
comment on table public.contact_messages is 'Contact form messages sent from sweillem.net. Insert-only for the website.';

create index quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;

-- Only what the website needs: insert, nothing else. The status column keeps its default.
revoke all on public.quote_requests, public.contact_messages from anon, authenticated;
grant insert (id, name, email, phone, company, country, project, message, items, page) on public.quote_requests to anon;
grant insert (id, name, email, phone, company, topic, message, page) on public.contact_messages to anon;

create policy "Website can send quote requests" on public.quote_requests
  for insert to anon with check (status = 'new');

create policy "Website can send contact messages" on public.contact_messages
  for insert to anon with check (status = 'new');
