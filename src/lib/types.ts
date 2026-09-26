export const ENTITY_TYPES = [
  "person",
  "organization",
  "phone",
  "vehicle",
  "location",
  "bank_account",
  "event",
] as const

export type EntityType = (typeof ENTITY_TYPES)[number]

export const RELATIONSHIP_TYPES = [
  "KNOWS",
  "MET_WITH",
  "COMMUNICATED_WITH",
  "USED",
  "OWNED_BY",
  "LOCATED_AT",
  "VISITED",
  "WORKED_FOR",
  "TRANSFERRED_TO",
  "ASSOCIATED_WITH",
  "INVOLVED_IN",
  "RELATED_TO",
] as const

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number] | (string & {})

export type Severity = "critical" | "high" | "medium" | "low"

/** One citation behind a derived claim. Every relationship carries a few. */
export interface Evidence {
  document: string
  ref: string
  snippet: string
}

export interface Entity {
  id: string
  type: EntityType
  name: string
  aliases: string[]
  metadata: Record<string, unknown>
  risk_score: number
  created_at: string
}

export interface Relationship {
  id: string
  source_id: string
  target_id: string
  type: RelationshipType
  confidence: number
  occurred_at: string | null
  evidence: Evidence[]
  created_at: string
}

export interface Case {
  id: string
  case_no: string
  title: string
  status: "open" | "active" | "under_review" | "closed"
  priority: Severity
  summary: string | null
  opened_at: string
  created_at: string
}

export interface CaseEntity {
  case_id: string
  entity_id: string
  role: string | null
}

export interface CaseDocument {
  id: string
  case_id: string | null
  filename: string
  kind: string
  size_bytes: number
  pages: number | null
  status: "queued" | "processing" | "processed" | "failed"
  extracted_count: number
  uploaded_at: string
}

export interface TimelineEvent {
  id: string
  case_id: string | null
  entity_ids: string[]
  type: string
  title: string
  description: string | null
  occurred_at: string
  location: string | null
  source_document: string | null
  confidence: number
}

export interface Alert {
  id: string
  case_id: string | null
  entity_id: string | null
  severity: Severity
  type: string
  title: string
  description: string | null
  rationale: Record<string, unknown>
  status: "new" | "reviewing" | "dismissed" | "confirmed"
  created_at: string
}

/** Per-entity graph analytics, computed client-side in `src/graph/metrics.ts`. */
export interface EntityMetrics {
  degree: number
  betweenness: number
  pagerank: number
  /** 0-100 blend of the three, used for ranking and node size. */
  priority: number
  community: number
  /** How many distinct communities this entity touches. >1 means a bridge. */
  bridges: number
}
