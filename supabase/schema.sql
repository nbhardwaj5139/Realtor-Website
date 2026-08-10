-- Lead storage for the KW real estate platform.
-- Apply in the Supabase SQL editor, then set SUPABASE_URL and
-- SUPABASE_SERVICE_ROLE_KEY. The app auto-detects Supabase when both are set.

create table if not exists public.leads (
  id           uuid primary key,
  created_at   timestamptz not null default now(),
  type         text not null check (type in ('valuation', 'tour', 'inquiry', 'contact')),
  status       text not null default 'new'
               check (status in ('new', 'contacted', 'nurturing', 'won', 'archived')),
  name         text not null,
  email        text not null,
  phone        text,
  message      text,
  source       text,
  valuation    jsonb,
  tour         jsonb,
  notes        text[] not null default '{}'
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);
create index if not exists leads_type_idx       on public.leads (type);
create index if not exists leads_email_idx      on public.leads (email);

-- The app talks to PostgREST with the service role key from server-side route
-- handlers only, which bypasses RLS. RLS is still enabled with no permissive
-- policies so that a leaked anon key cannot read the lead table.
alter table public.leads enable row level security;
