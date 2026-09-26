/**
 * Seeds the demo network into Supabase.
 *
 * Deliberately tiny, and deliberately shaped: cluster A (an Andheri robbery
 * crew) and cluster B (a transport / value-transfer channel) share exactly one
 * contact, Arjun Patil. Nothing else crosses between them.
 *
 * That shape is the point of the demo. Rahul Sharma has the highest degree --
 * he is the obvious suspect -- but Arjun sits on every path between the two
 * groups, so betweenness ranks him first. The two metrics disagree, and the
 * one that disagrees is the one that finds the intermediary a manual read of
 * the files would miss.
 *
 * Idempotent: fixed UUIDs, delete-then-insert.
 *
 *   node scripts/seed.mjs
 */
import { readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

// --- env ---------------------------------------------------------------
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
      }
    }
  } catch {
    /* both files are optional */
  }
}

const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error(
    "Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example to .env and fill both in."
  )
  process.exit(1)
}

const db = createClient(URL, KEY, { auth: { persistSession: false } })

// --- ids ---------------------------------------------------------------
// Fixed UUIDs so re-running the seed replaces rows rather than duplicating.
const id = (suffix) => `00000000-0000-4000-8000-00000000${suffix.padStart(4, "0")}`

const E = {
  rahul: id("0e01"),
  vikram: id("0e02"),
  sana: id("0e03"),
  arjun: id("0e04"),
  imran: id("0e05"),
  deepa: id("0e06"),
  meridian: id("0e07"),
  coastline: id("0e08"),
  phoneA: id("0e09"),
  phoneB: id("0e0a"),
  vehicle: id("0e0b"),
  andheri: id("0e0c"),
  bhiwandi: id("0e0d"),
  account: id("0e0e"),
}
const C = { robbery: id("0c01"), hawala: id("0c02") }

// --- entities ----------------------------------------------------------
const entities = [
  // Cluster A -- the Andheri crew
  {
    id: E.rahul,
    type: "person",
    name: "Rahul Sharma",
    aliases: ["R. Sharma", "Rahul K. Sharma"],
    risk_score: 74,
    metadata: { age: 34, city: "Mumbai", priors: 2, occupation: "Transport contractor" },
  },
  {
    id: E.vikram,
    type: "person",
    name: "Vikram Rao",
    aliases: ["V. Rao"],
    risk_score: 61,
    metadata: { age: 29, city: "Mumbai", priors: 1, occupation: "Driver" },
  },
  {
    id: E.sana,
    type: "person",
    name: "Sana Qureshi",
    aliases: [],
    risk_score: 38,
    metadata: { age: 31, city: "Mumbai", priors: 0, occupation: "Accounts clerk" },
  },

  // The bridge
  {
    id: E.arjun,
    type: "person",
    name: "Arjun Patil",
    aliases: ["A. Patil", "Arjun P."],
    risk_score: 82,
    metadata: { age: 41, city: "Thane", priors: 3, occupation: "Freight broker" },
  },

  // Cluster B -- transport and value transfer
  {
    id: E.imran,
    type: "person",
    name: "Imran Sheikh",
    aliases: ["I. Sheikh"],
    risk_score: 69,
    metadata: { age: 45, city: "Bhiwandi", priors: 2, occupation: "Warehouse owner" },
  },
  {
    id: E.deepa,
    type: "person",
    name: "Deepa Nair",
    aliases: [],
    risk_score: 44,
    metadata: { age: 37, city: "Bhiwandi", priors: 0, occupation: "Finance manager" },
  },

  {
    id: E.meridian,
    type: "organization",
    name: "Meridian Traders",
    aliases: ["Meridian Trading Co."],
    risk_score: 57,
    metadata: { registration: "U51909MH2019PTC0", sector: "Wholesale trade", employees: 11 },
  },
  {
    id: E.coastline,
    type: "organization",
    name: "Coastline Logistics",
    aliases: ["Coastline Log."],
    risk_score: 66,
    metadata: { registration: "U63030MH2017PTC1", sector: "Freight forwarding", employees: 34 },
  },

  {
    id: E.phoneA,
    type: "phone",
    name: "+91 98765 43210",
    aliases: [],
    risk_score: 63,
    metadata: { operator: "Airtel", circle: "Mumbai", active_since: "2024-11" },
  },
  {
    id: E.phoneB,
    type: "phone",
    name: "+91 99887 76655",
    aliases: [],
    risk_score: 51,
    metadata: { operator: "Jio", circle: "Thane", active_since: "2025-06" },
  },

  {
    id: E.vehicle,
    type: "vehicle",
    name: "MH01AB1234",
    aliases: [],
    risk_score: 58,
    metadata: { make: "Mahindra Bolero", colour: "White", registered_to: "Meridian Traders" },
  },

  {
    id: E.andheri,
    type: "location",
    name: "Andheri Station (East)",
    aliases: ["Andheri Stn"],
    risk_score: 30,
    metadata: { district: "Mumbai Suburban", lat: 19.1197, lon: 72.8464 },
  },
  {
    id: E.bhiwandi,
    type: "location",
    name: "Bhiwandi Warehouse Block C",
    aliases: ["Block C"],
    risk_score: 47,
    metadata: { district: "Thane", lat: 19.2813, lon: 73.0483 },
  },

  {
    id: E.account,
    type: "bank_account",
    name: "A/C XXXX7741",
    aliases: [],
    risk_score: 77,
    metadata: { bank: "Union Bank", branch: "Bhiwandi", ifsc: "UBIN0812345", opened: "2025-02" },
  },
]

// --- relationships -----------------------------------------------------
const ev = (document, ref, snippet) => ({ document, ref, snippet })

let relCount = 0
const rel = (source_id, target_id, type, confidence, occurred_at, evidence) => ({
  id: id(`0f${(++relCount).toString(16).padStart(2, "0")}`),
  source_id,
  target_id,
  type,
  confidence,
  occurred_at,
  evidence,
})

const relationships = [
  // ---- cluster A ----
  rel(E.rahul, E.vikram, "KNOWS", 0.94, "2026-08-02T00:00:00Z", [
    ev("FIR_1023.pdf", "Page 4", "Named Vikram Rao as a long-standing associate of Rahul Sharma."),
    ev("Surveillance_14.pdf", "Page 2", "Both subjects observed arriving together on 02 Aug."),
  ]),
  rel(E.rahul, E.sana, "KNOWS", 0.81, "2026-07-28T00:00:00Z", [
    ev("FIR_1023.pdf", "Page 6", "Sana Qureshi handled accounts for the same firm as Sharma."),
  ]),
  rel(E.vikram, E.sana, "KNOWS", 0.66, "2026-08-04T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #14022", "3 calls exchanged, total 11m 20s."),
  ]),
  rel(E.rahul, E.phoneA, "USED", 0.97, "2026-06-01T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #23891", "Subscriber record lists R. Sharma against 98765 43210."),
  ]),
  rel(E.vikram, E.phoneA, "COMMUNICATED_WITH", 0.74, "2026-08-08T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #14108", "9 calls to the Sharma handset in the fortnight before the incident."),
  ]),
  rel(E.rahul, E.vehicle, "USED", 0.89, "2026-08-10T18:30:00Z", [
    ev("Surveillance_14.pdf", "Page 3", "Sharma seen at the wheel of MH01AB1234."),
    ev("Vehicle_Records.xlsx", "Row 88", "Challan issued 10 Aug, driver named as R. Sharma."),
  ]),
  rel(E.vikram, E.vehicle, "USED", 0.83, "2026-08-05T00:00:00Z", [
    ev("Vehicle_Records.xlsx", "Row 72", "Logged as the named driver on two earlier trips."),
  ]),
  rel(E.rahul, E.meridian, "WORKED_FOR", 0.85, null, [
    ev("FIR_1023.pdf", "Page 2", "Employed as a transport contractor by Meridian Traders."),
  ]),
  rel(E.sana, E.meridian, "WORKED_FOR", 0.92, null, [
    ev("FIR_1023.pdf", "Page 6", "Qureshi confirmed as accounts clerk at Meridian Traders."),
  ]),
  rel(E.vehicle, E.andheri, "LOCATED_AT", 0.91, "2026-08-10T22:15:00Z", [
    ev("Vehicle_Records.xlsx", "Row 91", "ANPR hit, Andheri East, 22:15 on 10 Aug."),
  ]),
  rel(E.rahul, E.andheri, "VISITED", 0.78, "2026-08-10T18:30:00Z", [
    ev("Surveillance_14.pdf", "Page 2", "Subject present on the east concourse for about 40 minutes."),
  ]),
  rel(E.vikram, E.andheri, "VISITED", 0.72, "2026-08-10T18:35:00Z", [
    ev("Surveillance_14.pdf", "Page 2", "Second subject joined at 18:35."),
  ]),

  rel(E.sana, E.andheri, "VISITED", 0.64, "2026-08-07T00:00:00Z", [
    ev("Surveillance_14.pdf", "Page 4", "Observed on the east concourse on an earlier date; no contact recorded."),
  ]),

  // ---- the bridge: Arjun Patil, and nothing else, crosses A <-> B ----
  rel(E.arjun, E.rahul, "MET_WITH", 0.88, "2026-08-10T18:52:00Z", [
    ev("Surveillance_14.pdf", "Page 2", "Third subject identified as A. Patil; meeting lasted 22 minutes."),
    ev("FIR_1023.pdf", "Page 7", "A Thane-based broker was named but not traced."),
  ]),
  rel(E.arjun, E.phoneA, "COMMUNICATED_WITH", 0.93, "2026-08-09T09:20:00Z", [
    ev("CDR_June_2026.csv", "Record #23891", "17 calls in the 6 days before 10 Aug."),
  ]),
  rel(E.arjun, E.andheri, "VISITED", 0.75, "2026-08-10T18:45:00Z", [
    ev("Surveillance_14.pdf", "Page 2", "Arrived separately at 18:45 and left by the north exit."),
  ]),
  rel(E.arjun, E.imran, "KNOWS", 0.86, "2026-07-19T00:00:00Z", [
    ev("Intel_Brief_07.docx", "Para 12", "Patil described as the fixer who introduces carriers to Sheikh."),
  ]),
  rel(E.arjun, E.account, "TRANSFERRED_TO", 0.9, "2026-08-12T14:10:00Z", [
    ev("Transactions_Q2.xlsx", "Row 214", "INR 4,80,000 credited from a Thane branch on 12 Aug."),
  ]),

  // ---- cluster B ----
  rel(E.imran, E.deepa, "KNOWS", 0.9, null, [
    ev("Intel_Brief_07.docx", "Para 14", "Nair reports directly to Sheikh."),
  ]),
  rel(E.imran, E.phoneB, "USED", 0.95, "2026-06-15T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #31007", "Subscriber record lists I. Sheikh."),
  ]),
  rel(E.deepa, E.phoneB, "COMMUNICATED_WITH", 0.68, "2026-08-13T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #31044", "Regular short calls during warehouse operating hours."),
  ]),
  rel(E.imran, E.coastline, "WORKED_FOR", 0.93, null, [
    ev("Intel_Brief_07.docx", "Para 9", "Sheikh holds a controlling interest in Coastline Logistics."),
  ]),
  rel(E.deepa, E.coastline, "WORKED_FOR", 0.96, null, [
    ev("Intel_Brief_07.docx", "Para 14", "Nair listed as finance manager."),
  ]),
  rel(E.imran, E.account, "TRANSFERRED_TO", 0.87, "2026-08-13T11:02:00Z", [
    ev("Transactions_Q2.xlsx", "Row 219", "Six transfers in 48 hours, all under the reporting threshold."),
  ]),
  rel(E.deepa, E.account, "TRANSFERRED_TO", 0.79, "2026-08-13T16:44:00Z", [
    ev("Transactions_Q2.xlsx", "Row 226", "Authorised with the finance manager's credentials."),
  ]),
  rel(E.deepa, E.bhiwandi, "VISITED", 0.7, "2026-08-13T10:00:00Z", [
    ev("Surveillance_14.pdf", "Page 5", "Vehicle logged at the Block C gate."),
  ]),
  rel(E.imran, E.bhiwandi, "VISITED", 0.76, "2026-08-13T09:10:00Z", [
    ev("Surveillance_14.pdf", "Page 5", "Present at Block C for most of the working day."),
  ]),
  rel(E.coastline, E.bhiwandi, "LOCATED_AT", 0.98, null, [
    ev("Intel_Brief_07.docx", "Para 9", "Registered operating address."),
  ]),
]

// --- cases -------------------------------------------------------------
const cases = [
  {
    id: C.robbery,
    case_no: "CR-1023",
    title: "Andheri commercial robbery",
    status: "active",
    priority: "high",
    opened_at: "2026-08-11T09:00:00Z",
    summary:
      "Armed robbery at a commercial premises near Andheri East on the night of 10 August 2026. " +
      "Three subjects identified from station CCTV; a vehicle registered to Meridian Traders was " +
      "recorded leaving the area at 22:15.",
  },
  {
    id: C.hawala,
    case_no: "CR-1041",
    title: "Cross-district value transfer channel",
    status: "open",
    priority: "critical",
    opened_at: "2026-08-14T09:00:00Z",
    summary:
      "Structured transfers into a single Bhiwandi account, each sized below the reporting " +
      "threshold. Opened after a transaction-monitoring referral; possibly linked to CR-1023 " +
      "through a shared contact.",
  },
]

const caseEntities = [
  [C.robbery, E.rahul, "prime suspect"],
  [C.robbery, E.vikram, "suspect"],
  [C.robbery, E.sana, "witness"],
  [C.robbery, E.arjun, "person of interest"],
  [C.robbery, E.vehicle, "seized"],
  [C.robbery, E.andheri, "scene"],
  [C.robbery, E.phoneA, "under analysis"],
  [C.robbery, E.meridian, "associated entity"],
  [C.hawala, E.imran, "prime suspect"],
  [C.hawala, E.deepa, "suspect"],
  [C.hawala, E.arjun, "person of interest"],
  [C.hawala, E.account, "subject account"],
  [C.hawala, E.coastline, "associated entity"],
  [C.hawala, E.bhiwandi, "premises"],
  [C.hawala, E.phoneB, "under analysis"],
].map(([case_id, entity_id, role]) => ({ case_id, entity_id, role }))

const documents = [
  {
    id: id("0d01"), case_id: C.robbery, filename: "FIR_1023.pdf", kind: "fir",
    size_bytes: 412880, pages: 9, status: "processed", extracted_count: 23,
    uploaded_at: "2026-08-11T09:40:00Z",
  },
  {
    id: id("0d02"), case_id: C.robbery, filename: "Surveillance_14.pdf", kind: "surveillance",
    size_bytes: 1284112, pages: 6, status: "processed", extracted_count: 17,
    uploaded_at: "2026-08-11T11:05:00Z",
  },
  {
    id: id("0d03"), case_id: C.robbery, filename: "Vehicle_Records.xlsx", kind: "vehicle",
    size_bytes: 96400, pages: null, status: "processed", extracted_count: 8,
    uploaded_at: "2026-08-12T08:22:00Z",
  },
  {
    id: id("0d04"), case_id: C.hawala, filename: "CDR_June_2026.csv", kind: "cdr",
    size_bytes: 3902551, pages: null, status: "processed", extracted_count: 41,
    uploaded_at: "2026-08-14T10:15:00Z",
  },
  {
    id: id("0d05"), case_id: C.hawala, filename: "Transactions_Q2.xlsx", kind: "financial",
    size_bytes: 742003, pages: null, status: "processed", extracted_count: 29,
    uploaded_at: "2026-08-14T10:18:00Z",
  },
  {
    id: id("0d06"), case_id: C.hawala, filename: "Intel_Brief_07.docx", kind: "intelligence",
    size_bytes: 58220, pages: 4, status: "processed", extracted_count: 14,
    uploaded_at: "2026-08-15T16:30:00Z",
  },
]

const events = [
  {
    id: id("0901"), case_id: C.robbery, entity_ids: [E.arjun, E.phoneA, E.rahul],
    type: "communication", title: "17 calls in six days",
    description:
      "Call volume between Arjun Patil and the handset attributed to Rahul Sharma rises sharply " +
      "in the week before the incident.",
    occurred_at: "2026-08-09T09:20:00Z", location: null,
    source_document: "CDR_June_2026.csv", confidence: 0.93,
  },
  {
    id: id("0902"), case_id: C.robbery, entity_ids: [E.rahul, E.andheri],
    type: "location", title: "Rahul Sharma at Andheri East",
    description: "Present on the east concourse for roughly 40 minutes.",
    occurred_at: "2026-08-10T18:30:00Z", location: "Andheri Station (East)",
    source_document: "Surveillance_14.pdf", confidence: 0.78,
  },
  {
    id: id("0903"), case_id: C.robbery, entity_ids: [E.arjun, E.rahul, E.vikram, E.andheri],
    type: "meeting", title: "Patil meets Sharma and Rao",
    description:
      "22-minute meeting recorded by station CCTV; the third subject was later identified as A. Patil.",
    occurred_at: "2026-08-10T18:52:00Z", location: "Andheri Station (East)",
    source_document: "Surveillance_14.pdf", confidence: 0.88,
  },
  {
    id: id("0904"), case_id: C.robbery, entity_ids: [E.vehicle, E.andheri],
    type: "vehicle", title: "MH01AB1234 recorded leaving the area",
    description: "ANPR hit at 22:15, roughly four hours before the robbery was reported.",
    occurred_at: "2026-08-10T22:15:00Z", location: "Andheri East",
    source_document: "Vehicle_Records.xlsx", confidence: 0.91,
  },
  {
    id: id("0905"), case_id: C.robbery, entity_ids: [E.rahul, E.vikram],
    type: "crime", title: "Robbery reported, FIR 1023 registered",
    description: "Registered against unknown persons; two subjects were identified later that week.",
    occurred_at: "2026-08-11T02:40:00Z", location: "Andheri East",
    source_document: "FIR_1023.pdf", confidence: 0.99,
  },
  {
    id: id("0906"), case_id: C.hawala, entity_ids: [E.arjun, E.account],
    type: "transaction", title: "INR 4,80,000 credited to A/C XXXX7741",
    description: "Credit originating from a Thane branch, two days after the incident.",
    occurred_at: "2026-08-12T14:10:00Z", location: "Thane",
    source_document: "Transactions_Q2.xlsx", confidence: 0.9,
  },
  {
    id: id("0907"), case_id: C.hawala, entity_ids: [E.deepa, E.bhiwandi],
    type: "location", title: "Deepa Nair at Block C",
    description: "Vehicle logged at the warehouse gate.",
    occurred_at: "2026-08-13T10:00:00Z", location: "Bhiwandi Warehouse Block C",
    source_document: "Surveillance_14.pdf", confidence: 0.7,
  },
  {
    id: id("0908"), case_id: C.hawala, entity_ids: [E.imran, E.account],
    type: "transaction", title: "Six transfers in 48 hours",
    description:
      "Each transfer sized just below the reporting threshold -- the pattern that triggered the referral.",
    occurred_at: "2026-08-13T11:02:00Z", location: "Bhiwandi",
    source_document: "Transactions_Q2.xlsx", confidence: 0.87,
  },
  {
    id: id("0909"), case_id: C.hawala, entity_ids: [E.deepa, E.account],
    type: "transaction", title: "Transfer authorised by the finance manager",
    description: "Authorised using Nair's credentials outside normal working hours.",
    occurred_at: "2026-08-13T16:44:00Z", location: "Bhiwandi",
    source_document: "Transactions_Q2.xlsx", confidence: 0.79,
  },
  {
    id: id("090a"), case_id: C.hawala, entity_ids: [E.arjun, E.imran],
    type: "intelligence", title: "Patil named as an intermediary",
    description: "Intelligence brief describes Patil as the contact who introduces carriers to Sheikh.",
    occurred_at: "2026-08-15T16:30:00Z", location: null,
    source_document: "Intel_Brief_07.docx", confidence: 0.86,
  },
]

const alerts = [
  {
    id: id("0a01"), case_id: C.hawala, entity_id: E.arjun,
    severity: "critical", type: "network_bridge",
    title: "Arjun Patil bridges two otherwise separate groups",
    description:
      "Every path between the CR-1023 group and the CR-1041 group runs through this entity. " +
      "Removing it would split the network in two.",
    rationale: { metric: "betweenness_centrality", rank: 1, communities_bridged: 2 },
    status: "new",
  },
  {
    id: id("0a02"), case_id: C.hawala, entity_id: E.account,
    severity: "high", type: "unusual_transaction",
    title: "Structured credits into A/C XXXX7741",
    description:
      "Six credits in 48 hours against a 90-day baseline of about four per month, each sized " +
      "below the reporting threshold.",
    rationale: { metric: "transaction_frequency", baseline_per_month: 4, observed_48h: 6 },
    status: "reviewing",
  },
  {
    id: id("0a03"), case_id: C.robbery, entity_id: E.phoneA,
    severity: "high", type: "communication_spike",
    title: "Call volume spike before the incident",
    description:
      "17 calls to a single number in the six days before 10 August, against a weekly mean of 3.",
    rationale: { metric: "call_frequency", weekly_mean: 3, observed: 17 },
    status: "new",
  },
  {
    id: id("0a04"), case_id: C.robbery, entity_id: E.andheri,
    severity: "medium", type: "shared_location",
    title: "Three subjects co-located within 25 minutes",
    description: "Sharma, Rao and Patil all placed at Andheri East on the evening of 10 August.",
    rationale: { metric: "location_cooccurrence", subjects: 3, window_minutes: 25 },
    status: "new",
  },
  {
    id: id("0a05"), case_id: C.robbery, entity_id: E.rahul,
    severity: "medium", type: "entity_match",
    title: '"R. Sharma" may be the same person as Rahul Sharma',
    description:
      "Name similarity plus a shared handset across FIR_1023.pdf and CDR_June_2026.csv. " +
      "Needs an investigator's confirmation before the records are merged.",
    rationale: { metric: "entity_resolution", similarity: 0.92, signals: ["name", "phone"] },
    status: "new",
  },
]

// --- write -------------------------------------------------------------
const NIL = "00000000-0000-4000-8000-000000000000"

async function wipe(table) {
  const { error } = await db.from(table).delete().neq("id", NIL)
  if (error) throw new Error(`clear ${table}: ${error.message}`)
}

async function put(table, rows) {
  const { error } = await db.from(table).insert(rows)
  if (error) throw new Error(`insert ${table}: ${error.message}`)
  console.log(`  ${table.padEnd(14)} ${rows.length}`)
}

try {
  console.log("clearing...")
  // Children before parents. The FKs cascade anyway, but deleting explicitly
  // keeps the counts printed below honest.
  for (const t of ["alerts", "events", "documents", "relationships"]) await wipe(t)
  // case_entities has a composite PK, so it has no `id` to filter on.
  const { error: ceErr } = await db.from("case_entities").delete().not("case_id", "is", null)
  if (ceErr) throw new Error(`clear case_entities: ${ceErr.message}`)
  for (const t of ["cases", "entities"]) await wipe(t)

  console.log("seeding...")
  await put("entities", entities)
  await put("relationships", relationships)
  await put("cases", cases)
  await put("case_entities", caseEntities)
  await put("documents", documents)
  await put("events", events)
  await put("alerts", alerts)
  console.log("\ndone.")
} catch (e) {
  console.error("\nseed failed:", e.message)
  console.error("Has supabase/schema.sql been run in the Supabase SQL editor yet?")
  process.exit(1)
}
