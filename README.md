# Criminal Network Analysis — investigator console

Base UI for an AI-assisted criminal network analysis system: a knowledge graph
of people, organisations, identifiers, places and accounts, with influence
analysis, community detection, a timeline, alerts and an evidence trail behind
every derived claim.

React + TypeScript + Tailwind + shadcn/ui on the front, Supabase (Postgres) as
the store. Light by default, with a dark theme on the toggle in the header.
All data is **synthetic**.

## What is real, and what is not

Being clear about this matters more than the demo looking impressive:

| Real | Simulated |
|---|---|
| Degree, betweenness (Brandes), PageRank and Louvain communities, computed in the browser on every load | Document parsing. The ingest screen advances through pipeline stages on a timer and does not read your files |
| The evidence trail — every relationship carries the documents and record references it came from | Named entity recognition and relationship extraction. The graph is seeded, not extracted |
| Shortest-path and bridge analysis behind the assistant's answers | The assistant is a rule-based responder over the computed metrics, not a language model |

The seeded network is shaped so the analytics have something true to find:
two groups joined by exactly one person. **Rahul Sharma has the most
connections (7), but Arjun Patil has the highest betweenness (0.543)** — every
path between the two groups runs through him. That disagreement between the two
metrics is the point; it is the intermediary a manual read of the case files
would miss.

## Setup

Requires Node 18+ and a Supabase project.

```bash
npm install
```

Copy the environment template and fill it in:

```bash
cp .env.example .env
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are read by the browser.
`SUPABASE_SERVICE_ROLE_KEY` is used only by the seed script — it bypasses row
level security, so it must never be given a `VITE_` prefix or committed.

Create the schema by pasting [`supabase/schema.sql`](supabase/schema.sql) into
the Supabase SQL editor and running it. (PostgREST cannot run DDL, so this step
is manual unless you have the database password and use `supabase db push`.)

Then seed and run:

```bash
npm run seed
npm run dev
```

`npm run seed` writes the small 14-entity demo network via the Supabase JS
client (`scripts/seed.mjs`). For a larger, more realistic dataset — four
cases, 46 entities, 75 relationships, documents, timeline events and alerts —
paste [`supabase/seed.sql`](supabase/seed.sql) into the Supabase SQL editor
instead (or `npm run seed:sql` to regenerate it from
`scripts/gen-seed-sql.mjs`). It's idempotent (`truncate` then `insert`) and
keeps the same Rahul Sharma / Arjun Patil network shape the analytics are
built around, just with more of everything around it.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run seed` | Wipe and reload the synthetic network (idempotent) |
| `npm run lint` | oxlint |

## Layout

```
src/
  graph/metrics.ts        Brandes betweenness, PageRank, Louvain, shortest path
  graph/NetworkCanvas.tsx Force-directed canvas shared by the explorer and cases
  providers/              Loads the graph once, derives every metric from it
  pages/                  Dashboard, network, entities, cases, timeline,
                          alerts, ingest, assistant
  lib/assistant.ts        Rule-based question answering over the metrics
supabase/schema.sql       Tables, indexes and RLS policies
scripts/seed.mjs          The synthetic network, and the shape it encodes
```

Start with `src/graph/metrics.ts` and `scripts/seed.mjs` — between them they
explain what the whole interface is showing.

## Security posture

The demo ships without authentication. RLS is **on** for every table, with a
read-only policy for the browser key and an insert policy on `documents` alone
so the ingest screen can record an upload. Attempting to write anything else
from the browser is rejected by Postgres, not by the UI.

This is a demonstration posture and nothing more. Before this goes near real
case material: gate every policy on `auth.uid()` and an agency role claim, add
the audit log, and rotate any key that has been shared.

## Responsible use

This is a decision-support tool. It ranks where to look; it does not conclude
anything about anyone. Association within a network is not evidence of
wrongdoing, every derived link is shown with its confidence and its sources,
and an investigator verifies the finding.
