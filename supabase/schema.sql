-- ============================================================================
--  AI-Powered Criminal Network Analysis — schema
--  Run once in the Supabase SQL editor. Safe to re-run (drops and recreates).
--
--  Model: a single generic property graph (`entities` + `relationships`)
--  rather than one table per entity type. New entity or relationship kinds
--  are then data, not migrations, which is what a real ingestion pipeline
--  feeding this UI would need.
-- ============================================================================

drop table if exists public.alerts        cascade;
drop table if exists public.events        cascade;
drop table if exists public.documents     cascade;
drop table if exists public.case_entities cascade;
drop table if exists public.cases         cascade;
drop table if exists public.relationships cascade;
drop table if exists public.entities      cascade;

-- ---------------------------------------------------------------- entities --
create table public.entities (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in (
                'person','organization','phone','vehicle',
                'location','bank_account','event')),
  name        text not null,
  aliases     text[] not null default '{}',
  -- Type-specific attributes (dob, imei, registration, ifsc, ...). Kept as
  -- jsonb so extraction can attach whatever a source document yields.
  metadata    jsonb  not null default '{}'::jsonb,
  -- Analyst-facing 0-100 prior. Graph centrality is computed separately.
  risk_score  numeric(5,2) not null default 0,
  created_at  timestamptz not null default now()
);

create index entities_type_idx on public.entities (type);
create index entities_name_idx on public.entities (lower(name));

-- ----------------------------------------------------------- relationships --
create table public.relationships (
  id          uuid primary key default gen_random_uuid(),
  source_id   uuid not null references public.entities (id) on delete cascade,
  target_id   uuid not null references public.entities (id) on delete cascade,
  type        text not null,
  -- Extraction confidence, 0..1. Every derived claim in the UI shows this.
  confidence  numeric(4,3) not null default 0.5
                check (confidence >= 0 and confidence <= 1),
  occurred_at timestamptz,
  -- [{ document, ref, snippet }] — what the UI cites for traceability.
  evidence    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  check (source_id <> target_id)
);

create index relationships_source_idx on public.relationships (source_id);
create index relationships_target_idx on public.relationships (target_id);
create index relationships_type_idx   on public.relationships (type);

-- ------------------------------------------------------------------- cases --
create table public.cases (
  id         uuid primary key default gen_random_uuid(),
  case_no    text not null unique,
  title      text not null,
  status     text not null default 'open'
               check (status in ('open','active','under_review','closed')),
  priority   text not null default 'medium'
               check (priority in ('critical','high','medium','low')),
  summary    text,
  opened_at  timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.case_entities (
  case_id   uuid not null references public.cases (id) on delete cascade,
  entity_id uuid not null references public.entities (id) on delete cascade,
  role      text,
  primary key (case_id, entity_id)
);

-- --------------------------------------------------------------- documents --
create table public.documents (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid references public.cases (id) on delete cascade,
  filename        text not null,
  kind            text not null default 'other',
  size_bytes      bigint not null default 0,
  pages           integer,
  status          text not null default 'queued'
                    check (status in ('queued','processing','processed','failed')),
  extracted_count integer not null default 0,
  uploaded_at     timestamptz not null default now()
);

create index documents_case_idx on public.documents (case_id);

-- ------------------------------------------------------------------ events --
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid references public.cases (id) on delete cascade,
  -- Denormalised participant list: the timeline reads far more than it writes.
  entity_ids      uuid[] not null default '{}',
  type            text not null,
  title           text not null,
  description     text,
  occurred_at     timestamptz not null,
  location        text,
  source_document text,
  confidence      numeric(4,3) not null default 0.8
);

create index events_occurred_idx on public.events (occurred_at desc);

-- ------------------------------------------------------------------ alerts --
create table public.alerts (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid references public.cases (id) on delete cascade,
  entity_id   uuid references public.entities (id) on delete set null,
  severity    text not null check (severity in ('critical','high','medium','low')),
  type        text not null,
  title       text not null,
  description text,
  -- Why the system raised this: the metric and value behind the flag.
  rationale   jsonb not null default '{}'::jsonb,
  status      text not null default 'new'
                check (status in ('new','reviewing','dismissed','confirmed')),
  created_at  timestamptz not null default now()
);

create index alerts_severity_idx on public.alerts (severity);

-- ================================ RLS =======================================
--  DEMO POSTURE: the app ships without authentication, so the browser key
--  (`anon`) gets read-only access to everything, plus insert on `documents`
--  so the ingestion screen can record an upload.
--  Before any real deployment: drop these policies and gate on auth.uid()
--  and a per-agency role claim. Do not put real case data behind this.
-- ============================================================================

alter table public.entities      enable row level security;
alter table public.relationships enable row level security;
alter table public.cases         enable row level security;
alter table public.case_entities enable row level security;
alter table public.documents     enable row level security;
alter table public.events        enable row level security;
alter table public.alerts        enable row level security;

create policy "demo read" on public.entities      for select to anon, authenticated using (true);
create policy "demo read" on public.relationships for select to anon, authenticated using (true);
create policy "demo read" on public.cases         for select to anon, authenticated using (true);
create policy "demo read" on public.case_entities for select to anon, authenticated using (true);
create policy "demo read" on public.documents     for select to anon, authenticated using (true);
create policy "demo read" on public.events        for select to anon, authenticated using (true);
create policy "demo read" on public.alerts        for select to anon, authenticated using (true);

-- Ingestion screen writes an upload record. Demo only.
create policy "demo insert documents" on public.documents
  for insert to anon, authenticated with check (true);
create policy "demo update documents" on public.documents
  for update to anon, authenticated using (true) with check (true);
