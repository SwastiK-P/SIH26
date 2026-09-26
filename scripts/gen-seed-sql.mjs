// Generates supabase/seed.sql — a larger, self-contained synthetic dataset
// for the criminal-network schema. Run with: node gen_seed.mjs > seed.sql
//
// ID scheme (all fixed, so the script is idempotent via TRUNCATE + INSERT):
//   entities      00000000-0000-4000-8000-00000000eNNN   (matches scripts/seed.mjs for the
//                                                          14 original entities, extended)
//   relationships 00000000-0000-4000-9000-000000000NNN
//   cases         00000000-0000-4000-8000-00000000cNNN   (matches scripts/seed.mjs)
//   documents     00000000-0000-4000-a000-000000000NNN
//   events        00000000-0000-4000-b000-000000000NNN
//   alerts        00000000-0000-4000-c000-000000000NNN

const eid = (n) => `00000000-0000-4000-8000-00000000e${n.toString(16).padStart(3, "0")}`
const cid = (n) => `00000000-0000-4000-8000-00000000c${n.toString(16).padStart(3, "0")}`
let relN = 0, docN = 0, evN = 0, alN = 0
const rid = () => `00000000-0000-4000-9000-${(++relN).toString(16).padStart(12, "0")}`
const did = () => `00000000-0000-4000-a000-${(++docN).toString(16).padStart(12, "0")}`
const vid = () => `00000000-0000-4000-b000-${(++evN).toString(16).padStart(12, "0")}`
const aid = () => `00000000-0000-4000-c000-${(++alN).toString(16).padStart(12, "0")}`

// ---------------------------------------------------------------- entities --
// n = numeric suffix reused across the 14 originals (1..14) then new ones (15..)
const E = {
  rahul: eid(1), vikram: eid(2), sana: eid(3), arjun: eid(4), imran: eid(5),
  deepa: eid(6), meridian: eid(7), coastline: eid(8), phoneA: eid(9), phoneB: eid(10),
  vehicle: eid(11), andheri: eid(12), bhiwandi: eid(13), account: eid(14),
  // cluster A extensions
  feroz: eid(15), anita: eid(16), suresh: eid(17), phoneFeroz: eid(18),
  motorcycle: eid(19), kurlaMarket: eid(20),
  // cluster B extensions
  ravi: eid(21), meena: eid(22), salim: eid(23), phoneRavi: eid(24), phoneMeena: eid(25),
  accountMule1: eid(26), accountMule2: eid(27), godown: eid(28),
  // cluster C — loan-app extortion (new, unconnected case)
  nikhil: eid(29), priya: eid(30), kunal: eid(31), rekha: eid(32), quickcash: eid(33),
  phoneNikhil: eid(34), phonePriya: eid(35), accountQuickcash: eid(36), powaiOffice: eid(37),
  bikeIntimidation: eid(38),
  // cluster D — vehicle theft ring (new, unconnected case)
  sameer: eid(39), ganesh: eid(40), irfan: eid(41), pawarAuto: eid(42),
  stolenSwift: eid(43), stolenCreta: eid(44), vasaiYard: eid(45), phoneSameer: eid(46),
}

const entities = [
  // ================= cluster A: Andheri robbery crew =================
  { id: E.rahul, type: "person", name: "Rahul Sharma", aliases: ["R. Sharma", "Rahul K. Sharma"], risk_score: 74,
    metadata: { age: 34, city: "Mumbai", priors: 2, occupation: "Transport contractor" } },
  { id: E.vikram, type: "person", name: "Vikram Rao", aliases: ["V. Rao"], risk_score: 61,
    metadata: { age: 29, city: "Mumbai", priors: 1, occupation: "Driver" } },
  { id: E.sana, type: "person", name: "Sana Qureshi", aliases: [], risk_score: 38,
    metadata: { age: 31, city: "Mumbai", priors: 0, occupation: "Accounts clerk" } },
  { id: E.feroz, type: "person", name: "Feroz Ansari", aliases: ["F. Ansari"], risk_score: 55,
    metadata: { age: 24, city: "Mumbai", priors: 1, occupation: "Unemployed" } },
  { id: E.anita, type: "person", name: "Anita Kulkarni", aliases: [], risk_score: 49,
    metadata: { age: 52, city: "Mumbai", priors: 1, occupation: "Electronics shop owner" } },
  { id: E.suresh, type: "person", name: "Suresh Yadav", aliases: [], risk_score: 12,
    metadata: { age: 46, city: "Mumbai", priors: 0, occupation: "Shopkeeper", note: "Witness, not a suspect" } },
  { id: E.phoneFeroz, type: "phone", name: "+91 90909 12121", aliases: [], risk_score: 44,
    metadata: { operator: "Vi", circle: "Mumbai", active_since: "2025-09" } },
  { id: E.motorcycle, type: "vehicle", name: "MH02CD5678", aliases: [], risk_score: 41,
    metadata: { make: "Bajaj Pulsar", colour: "Black", registered_to: "Feroz Ansari" } },
  { id: E.kurlaMarket, type: "location", name: "Kurla Electronics Market", aliases: [], risk_score: 33,
    metadata: { district: "Mumbai Suburban", lat: 19.0728, lon: 72.8826 } },

  // ================= bridge =================
  { id: E.arjun, type: "person", name: "Arjun Patil", aliases: ["A. Patil", "Arjun P."], risk_score: 82,
    metadata: { age: 41, city: "Thane", priors: 3, occupation: "Freight broker" } },

  // ================= cluster B: transport / value transfer =================
  { id: E.imran, type: "person", name: "Imran Sheikh", aliases: ["I. Sheikh"], risk_score: 69,
    metadata: { age: 45, city: "Bhiwandi", priors: 2, occupation: "Warehouse owner" } },
  { id: E.deepa, type: "person", name: "Deepa Nair", aliases: [], risk_score: 44,
    metadata: { age: 37, city: "Bhiwandi", priors: 0, occupation: "Finance manager" } },
  { id: E.ravi, type: "person", name: "Ravi Chavan", aliases: [], risk_score: 47,
    metadata: { age: 27, city: "Bhiwandi", priors: 0, occupation: "Courier" } },
  { id: E.meena, type: "person", name: "Meena Joshi", aliases: [], risk_score: 39,
    metadata: { age: 33, city: "Bhiwandi", priors: 0, occupation: "Courier" } },
  { id: E.salim, type: "person", name: "Salim Mirza", aliases: [], risk_score: 58,
    metadata: { age: 25, city: "Bhiwandi", priors: 1, occupation: "Unemployed", note: "Mule account holder" } },
  { id: E.meridian, type: "organization", name: "Meridian Traders", aliases: ["Meridian Trading Co."], risk_score: 57,
    metadata: { registration: "U51909MH2019PTC0", sector: "Wholesale trade", employees: 11 } },
  { id: E.coastline, type: "organization", name: "Coastline Logistics", aliases: ["Coastline Log."], risk_score: 66,
    metadata: { registration: "U63030MH2017PTC1", sector: "Freight forwarding", employees: 34 } },
  { id: E.phoneA, type: "phone", name: "+91 98765 43210", aliases: [], risk_score: 63,
    metadata: { operator: "Airtel", circle: "Mumbai", active_since: "2024-11" } },
  { id: E.phoneB, type: "phone", name: "+91 99887 76655", aliases: [], risk_score: 51,
    metadata: { operator: "Jio", circle: "Thane", active_since: "2025-06" } },
  { id: E.phoneRavi, type: "phone", name: "+91 91234 56780", aliases: [], risk_score: 36,
    metadata: { operator: "Jio", circle: "Thane", active_since: "2025-03" } },
  { id: E.phoneMeena, type: "phone", name: "+91 93456 78901", aliases: [], risk_score: 31,
    metadata: { operator: "Vi", circle: "Thane", active_since: "2025-04" } },
  { id: E.vehicle, type: "vehicle", name: "MH01AB1234", aliases: [], risk_score: 58,
    metadata: { make: "Mahindra Bolero", colour: "White", registered_to: "Meridian Traders" } },
  { id: E.andheri, type: "location", name: "Andheri Station (East)", aliases: ["Andheri Stn"], risk_score: 30,
    metadata: { district: "Mumbai Suburban", lat: 19.1197, lon: 72.8464 } },
  { id: E.bhiwandi, type: "location", name: "Bhiwandi Warehouse Block C", aliases: ["Block C"], risk_score: 47,
    metadata: { district: "Thane", lat: 19.2813, lon: 73.0483 } },
  { id: E.godown, type: "location", name: "Ghodbunder Road Godown", aliases: [], risk_score: 40,
    metadata: { district: "Thane", lat: 19.2647, lon: 72.9781 } },
  { id: E.account, type: "bank_account", name: "A/C XXXX7741", aliases: [], risk_score: 77,
    metadata: { bank: "Union Bank", branch: "Bhiwandi", ifsc: "UBIN0812345", opened: "2025-02" } },
  { id: E.accountMule1, type: "bank_account", name: "A/C XXXX2290", aliases: [], risk_score: 71,
    metadata: { bank: "IDBI Bank", branch: "Bhiwandi", ifsc: "IBKL0001122", opened: "2026-04", holder: "Salim Mirza" } },
  { id: E.accountMule2, type: "bank_account", name: "A/C XXXX5567", aliases: [], risk_score: 68,
    metadata: { bank: "Bank of Baroda", branch: "Kalyan", ifsc: "BARB0KALYAN", opened: "2026-05", holder: "Salim Mirza" } },

  // ================= cluster C: loan-app extortion racket (unrelated case) =================
  { id: E.nikhil, type: "person", name: "Nikhil Verma", aliases: ["N. Verma"], risk_score: 79,
    metadata: { age: 33, city: "Mumbai", priors: 1, occupation: "App operator / director" } },
  { id: E.priya, type: "person", name: "Priya Malhotra", aliases: [], risk_score: 65,
    metadata: { age: 28, city: "Mumbai", priors: 1, occupation: "Recovery agent" } },
  { id: E.kunal, type: "person", name: "Kunal Bhatt", aliases: [], risk_score: 62,
    metadata: { age: 30, city: "Mumbai", priors: 2, occupation: "Recovery agent" } },
  { id: E.rekha, type: "person", name: "Rekha Iyer", aliases: [], risk_score: 4,
    metadata: { age: 41, city: "Mumbai", priors: 0, occupation: "Schoolteacher", note: "Complainant / victim" } },
  { id: E.quickcash, type: "organization", name: "QuickCash Fintech Pvt Ltd", aliases: ["QuickCash"], risk_score: 84,
    metadata: { registration: "U65999MH2024PTC2", sector: "Digital lending", employees: 6, note: "Unlicensed lender" } },
  { id: E.phoneNikhil, type: "phone", name: "+91 95555 11122", aliases: [], risk_score: 70,
    metadata: { operator: "Airtel", circle: "Mumbai", active_since: "2025-01" } },
  { id: E.phonePriya, type: "phone", name: "+91 95555 33344", aliases: [], risk_score: 60,
    metadata: { operator: "Jio", circle: "Mumbai", active_since: "2025-02" } },
  { id: E.accountQuickcash, type: "bank_account", name: "A/C XXXX9081", aliases: [], risk_score: 80,
    metadata: { bank: "Yes Bank", branch: "Powai", ifsc: "YESB0000456", opened: "2025-01" } },
  { id: E.powaiOffice, type: "location", name: "Powai Business Park, Unit 402", aliases: [], risk_score: 52,
    metadata: { district: "Mumbai Suburban", lat: 19.1176, lon: 72.9060 } },
  { id: E.bikeIntimidation, type: "vehicle", name: "MH04EF9012", aliases: [], risk_score: 45,
    metadata: { make: "Honda Activa", colour: "Grey", registered_to: "Kunal Bhatt" } },

  // ================= cluster D: vehicle-theft / chop-shop ring (unrelated case) =================
  { id: E.sameer, type: "person", name: "Sameer Ansari", aliases: ["S. Ansari"], risk_score: 71,
    metadata: { age: 39, city: "Vasai", priors: 3, occupation: "Chop-shop owner" } },
  { id: E.ganesh, type: "person", name: "Ganesh Pawar", aliases: [], risk_score: 64,
    metadata: { age: 26, city: "Vasai", priors: 2, occupation: "Vehicle thief" } },
  { id: E.irfan, type: "person", name: "Irfan Shaikh", aliases: ["I. Shaikh"], risk_score: 53,
    metadata: { age: 44, city: "Pune", priors: 1, occupation: "Spare-parts dealer" } },
  { id: E.pawarAuto, type: "organization", name: "Pawar Auto Parts", aliases: [], risk_score: 62,
    metadata: { registration: "U50300MH2021PTC3", sector: "Auto parts trade", employees: 4 } },
  { id: E.stolenSwift, type: "vehicle", name: "MH12GH3456", aliases: [], risk_score: 66,
    metadata: { make: "Maruti Suzuki Swift", colour: "Red", status: "Reported stolen 2026-07-30" } },
  { id: E.stolenCreta, type: "vehicle", name: "MH14IJ7890", aliases: [], risk_score: 66,
    metadata: { make: "Hyundai Creta", colour: "White", status: "Reported stolen 2026-08-05" } },
  { id: E.vasaiYard, type: "location", name: "Vasai Chop-Shop Yard", aliases: [], risk_score: 73,
    metadata: { district: "Palghar", lat: 19.3919, lon: 72.8397 } },
  { id: E.phoneSameer, type: "phone", name: "+91 96666 22233", aliases: [], risk_score: 55,
    metadata: { operator: "Jio", circle: "Vasai", active_since: "2024-08" } },
]

// ----------------------------------------------------------- relationships --
const ev = (document, ref, snippet) => ({ document, ref, snippet })
const rel = (source_id, target_id, type, confidence, occurred_at, evidence) => ({
  id: rid(), source_id, target_id, type, confidence, occurred_at, evidence,
})

const relationships = [
  // ---- cluster A: Andheri crew ----
  rel(E.rahul, E.vikram, "KNOWS", 0.94, "2026-08-02T00:00:00Z", [
    ev("FIR_1023.pdf", "Page 4", "Named Vikram Rao as a long-standing associate of Rahul Sharma.") ]),
  rel(E.rahul, E.sana, "KNOWS", 0.81, "2026-07-28T00:00:00Z", [
    ev("FIR_1023.pdf", "Page 6", "Sana Qureshi handled accounts for the same firm as Sharma.") ]),
  rel(E.vikram, E.sana, "KNOWS", 0.66, "2026-08-04T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #14022", "3 calls exchanged, total 11m 20s.") ]),
  rel(E.rahul, E.phoneA, "USED", 0.97, "2026-06-01T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #23891", "Subscriber record lists R. Sharma against 98765 43210.") ]),
  rel(E.vikram, E.phoneA, "COMMUNICATED_WITH", 0.74, "2026-08-08T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #14108", "9 calls to the Sharma handset in the fortnight before the incident.") ]),
  rel(E.rahul, E.vehicle, "USED", 0.89, "2026-08-10T18:30:00Z", [
    ev("Surveillance_14.pdf", "Page 3", "Sharma seen at the wheel of MH01AB1234."),
    ev("Vehicle_Records.xlsx", "Row 88", "Challan issued 10 Aug, driver named as R. Sharma.") ]),
  rel(E.vikram, E.vehicle, "USED", 0.83, "2026-08-05T00:00:00Z", [
    ev("Vehicle_Records.xlsx", "Row 72", "Logged as the named driver on two earlier trips.") ]),
  rel(E.rahul, E.meridian, "WORKED_FOR", 0.85, null, [
    ev("FIR_1023.pdf", "Page 2", "Employed as a transport contractor by Meridian Traders.") ]),
  rel(E.sana, E.meridian, "WORKED_FOR", 0.92, null, [
    ev("FIR_1023.pdf", "Page 6", "Qureshi confirmed as accounts clerk at Meridian Traders.") ]),
  rel(E.vehicle, E.andheri, "LOCATED_AT", 0.91, "2026-08-10T22:15:00Z", [
    ev("Vehicle_Records.xlsx", "Row 91", "ANPR hit, Andheri East, 22:15 on 10 Aug.") ]),
  rel(E.rahul, E.andheri, "VISITED", 0.78, "2026-08-10T18:30:00Z", [
    ev("Surveillance_14.pdf", "Page 2", "Subject present on the east concourse for about 40 minutes.") ]),
  rel(E.vikram, E.andheri, "VISITED", 0.72, "2026-08-10T18:35:00Z", [
    ev("Surveillance_14.pdf", "Page 2", "Second subject joined at 18:35.") ]),
  rel(E.sana, E.andheri, "VISITED", 0.64, "2026-08-07T00:00:00Z", [
    ev("Surveillance_14.pdf", "Page 4", "Observed on the east concourse on an earlier date; no contact recorded.") ]),
  rel(E.rahul, E.feroz, "KNOWS", 0.7, "2026-08-01T00:00:00Z", [
    ev("Intel_Brief_09.docx", "Para 3", "Ansari described as a lookout Sharma has used before.") ]),
  rel(E.feroz, E.phoneFeroz, "USED", 0.88, "2025-09-20T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #14290", "Subscriber record lists F. Ansari.") ]),
  rel(E.feroz, E.phoneA, "COMMUNICATED_WITH", 0.69, "2026-08-10T17:00:00Z", [
    ev("CDR_June_2026.csv", "Record #14301", "5 calls to the Sharma handset in the hour before the meeting.") ]),
  rel(E.feroz, E.andheri, "VISITED", 0.6, "2026-08-10T18:00:00Z", [
    ev("Surveillance_14.pdf", "Page 3", "Unidentified male loitering near the east exit; later matched to Ansari.") ]),
  rel(E.rahul, E.anita, "MET_WITH", 0.58, "2026-08-11T13:00:00Z", [
    ev("Intel_Brief_09.docx", "Para 5", "Sharma seen entering Kulkarni's shop the morning after the incident.") ]),
  rel(E.anita, E.kurlaMarket, "LOCATED_AT", 0.95, null, [
    ev("Intel_Brief_09.docx", "Para 4", "Registered shop address, Kurla Electronics Market.") ]),
  rel(E.vikram, E.motorcycle, "USED", 0.62, "2026-08-09T00:00:00Z", [
    ev("Vehicle_Records.xlsx", "Row 95", "Registered to Ansari; logged on a recce pass the evening before.") ]),
  rel(E.suresh, E.rahul, "IDENTIFIED", 0.41, "2026-08-11T09:20:00Z", [
    ev("FIR_1023.pdf", "Page 8", "Shopkeeper's statement tentatively identifies one subject from a photo array.") ]),

  // ---- the bridge: Arjun Patil, and nothing else, crosses A <-> B ----
  rel(E.arjun, E.rahul, "MET_WITH", 0.88, "2026-08-10T18:52:00Z", [
    ev("Surveillance_14.pdf", "Page 2", "Third subject identified as A. Patil; meeting lasted 22 minutes."),
    ev("FIR_1023.pdf", "Page 7", "A Thane-based broker was named but not traced.") ]),
  rel(E.arjun, E.phoneA, "COMMUNICATED_WITH", 0.93, "2026-08-09T09:20:00Z", [
    ev("CDR_June_2026.csv", "Record #23891", "17 calls in the 6 days before 10 Aug.") ]),
  rel(E.arjun, E.andheri, "VISITED", 0.75, "2026-08-10T18:45:00Z", [
    ev("Surveillance_14.pdf", "Page 2", "Arrived separately at 18:45 and left by the north exit.") ]),
  rel(E.arjun, E.imran, "KNOWS", 0.86, "2026-07-19T00:00:00Z", [
    ev("Intel_Brief_07.docx", "Para 12", "Patil described as the fixer who introduces carriers to Sheikh.") ]),
  rel(E.arjun, E.account, "TRANSFERRED_TO", 0.9, "2026-08-12T14:10:00Z", [
    ev("Transactions_Q2.xlsx", "Row 214", "INR 4,80,000 credited from a Thane branch on 12 Aug.") ]),

  // ---- cluster B: transport and value transfer ----
  rel(E.imran, E.deepa, "KNOWS", 0.9, null, [
    ev("Intel_Brief_07.docx", "Para 14", "Nair reports directly to Sheikh.") ]),
  rel(E.imran, E.phoneB, "USED", 0.95, "2026-06-15T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #31007", "Subscriber record lists I. Sheikh.") ]),
  rel(E.deepa, E.phoneB, "COMMUNICATED_WITH", 0.68, "2026-08-13T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #31044", "Regular short calls during warehouse operating hours.") ]),
  rel(E.imran, E.coastline, "WORKED_FOR", 0.93, null, [
    ev("Intel_Brief_07.docx", "Para 9", "Sheikh holds a controlling interest in Coastline Logistics.") ]),
  rel(E.deepa, E.coastline, "WORKED_FOR", 0.96, null, [
    ev("Intel_Brief_07.docx", "Para 14", "Nair listed as finance manager.") ]),
  rel(E.imran, E.account, "TRANSFERRED_TO", 0.87, "2026-08-13T11:02:00Z", [
    ev("Transactions_Q2.xlsx", "Row 219", "Six transfers in 48 hours, all under the reporting threshold.") ]),
  rel(E.deepa, E.account, "TRANSFERRED_TO", 0.79, "2026-08-13T16:44:00Z", [
    ev("Transactions_Q2.xlsx", "Row 226", "Authorised with the finance manager's credentials.") ]),
  rel(E.deepa, E.bhiwandi, "VISITED", 0.7, "2026-08-13T10:00:00Z", [
    ev("Surveillance_14.pdf", "Page 5", "Vehicle logged at the Block C gate.") ]),
  rel(E.imran, E.bhiwandi, "VISITED", 0.76, "2026-08-13T09:10:00Z", [
    ev("Surveillance_14.pdf", "Page 5", "Present at Block C for most of the working day.") ]),
  rel(E.coastline, E.bhiwandi, "LOCATED_AT", 0.98, null, [
    ev("Intel_Brief_07.docx", "Para 9", "Registered operating address.") ]),
  rel(E.imran, E.ravi, "KNOWS", 0.84, null, [
    ev("Intel_Brief_07.docx", "Para 16", "Chavan named as a regular courier for Sheikh's consignments.") ]),
  rel(E.imran, E.meena, "KNOWS", 0.8, null, [
    ev("Intel_Brief_07.docx", "Para 16", "Joshi named alongside Chavan as a second courier.") ]),
  rel(E.ravi, E.phoneRavi, "USED", 0.9, "2025-03-11T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #31102", "Subscriber record lists R. Chavan.") ]),
  rel(E.meena, E.phoneMeena, "USED", 0.88, "2025-04-02T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #31115", "Subscriber record lists M. Joshi.") ]),
  rel(E.ravi, E.phoneB, "COMMUNICATED_WITH", 0.71, "2026-08-12T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #31120", "Daily calls to the Sheikh handset during the transfer window.") ]),
  rel(E.meena, E.phoneB, "COMMUNICATED_WITH", 0.67, "2026-08-12T00:00:00Z", [
    ev("CDR_June_2026.csv", "Record #31126", "Daily calls to the Sheikh handset during the transfer window.") ]),
  rel(E.deepa, E.salim, "KNOWS", 0.73, "2026-07-30T00:00:00Z", [
    ev("Intel_Brief_07.docx", "Para 18", "Nair introduced Mirza to open two accounts for the channel.") ]),
  rel(E.salim, E.accountMule1, "TRANSFERRED_TO", 0.85, "2026-08-14T10:05:00Z", [
    ev("Transactions_Q2.xlsx", "Row 241", "Account opened in Mirza's name, first credit within a week.") ]),
  rel(E.salim, E.accountMule2, "TRANSFERRED_TO", 0.82, "2026-08-16T09:40:00Z", [
    ev("Transactions_Q2.xlsx", "Row 248", "Second mule account, same holder, different bank.") ]),
  rel(E.accountMule1, E.account, "TRANSFERRED_TO", 0.77, "2026-08-15T00:00:00Z", [
    ev("Transactions_Q2.xlsx", "Row 244", "Consolidating transfer to the primary Bhiwandi account.") ]),
  rel(E.accountMule2, E.account, "TRANSFERRED_TO", 0.74, "2026-08-17T00:00:00Z", [
    ev("Transactions_Q2.xlsx", "Row 251", "Consolidating transfer to the primary Bhiwandi account.") ]),
  rel(E.ravi, E.godown, "VISITED", 0.69, "2026-08-14T00:00:00Z", [
    ev("Surveillance_19.pdf", "Page 2", "Logged dropping a consignment at the Ghodbunder Road site.") ]),
  rel(E.meena, E.godown, "VISITED", 0.65, "2026-08-15T00:00:00Z", [
    ev("Surveillance_19.pdf", "Page 3", "Logged at the same site the following day.") ]),
  rel(E.coastline, E.godown, "LOCATED_AT", 0.7, null, [
    ev("Intel_Brief_07.docx", "Para 20", "Secondary, unregistered storage site linked to Coastline Logistics.") ]),

  // ================= cluster C: loan-app extortion (own case, no link to A/B) =================
  rel(E.nikhil, E.priya, "KNOWS", 0.9, null, [
    ev("FIR_1077.pdf", "Page 3", "Malhotra named as a recovery agent reporting to Verma.") ]),
  rel(E.nikhil, E.kunal, "KNOWS", 0.88, null, [
    ev("FIR_1077.pdf", "Page 3", "Bhatt named as a second recovery agent reporting to Verma.") ]),
  rel(E.priya, E.kunal, "KNOWS", 0.79, "2026-08-20T00:00:00Z", [
    ev("CDR_Loan_App.csv", "Record #802", "Frequent contact consistent with joint recovery visits.") ]),
  rel(E.nikhil, E.quickcash, "WORKED_FOR", 0.97, null, [
    ev("MCA_Filing_QuickCash.pdf", "Page 1", "Verma listed as director of QuickCash Fintech Pvt Ltd.") ]),
  rel(E.priya, E.quickcash, "WORKED_FOR", 0.85, null, [
    ev("Complaint_Rekha_Iyer.pdf", "Page 2", "Complainant names Malhotra as a QuickCash collections agent.") ]),
  rel(E.kunal, E.quickcash, "WORKED_FOR", 0.85, null, [
    ev("Complaint_Rekha_Iyer.pdf", "Page 2", "Complainant names Bhatt as a QuickCash collections agent.") ]),
  rel(E.nikhil, E.phoneNikhil, "USED", 0.93, "2025-01-15T00:00:00Z", [
    ev("CDR_Loan_App.csv", "Record #700", "Subscriber record lists N. Verma.") ]),
  rel(E.priya, E.phonePriya, "USED", 0.9, "2025-02-10T00:00:00Z", [
    ev("CDR_Loan_App.csv", "Record #706", "Subscriber record lists P. Malhotra.") ]),
  rel(E.quickcash, E.powaiOffice, "LOCATED_AT", 0.96, null, [
    ev("MCA_Filing_QuickCash.pdf", "Page 1", "Registered office address.") ]),
  rel(E.quickcash, E.accountQuickcash, "TRANSFERRED_TO", 0.88, null, [
    ev("Transactions_QuickCash.xlsx", "Row 12", "Collections account named on the loan agreement template.") ]),
  rel(E.rekha, E.accountQuickcash, "TRANSFERRED_TO", 0.91, "2026-08-18T20:14:00Z", [
    ev("Transactions_QuickCash.xlsx", "Row 55", "Payment matching the amount cited in the complaint."),
    ev("Complaint_Rekha_Iyer.pdf", "Page 1", "Complainant states she paid after repeated threatening calls.") ]),
  rel(E.priya, E.rekha, "THREATENED", 0.83, "2026-08-18T19:40:00Z", [
    ev("Complaint_Rekha_Iyer.pdf", "Page 1", "Complainant identifies Malhotra's voice from a recorded call.") ]),
  rel(E.kunal, E.rekha, "THREATENED", 0.77, "2026-08-19T08:15:00Z", [
    ev("Complaint_Rekha_Iyer.pdf", "Page 2", "Second call, complainant recognises the same threats repeated.") ]),
  rel(E.kunal, E.bikeIntimidation, "USED", 0.72, "2026-08-19T18:00:00Z", [
    ev("Surveillance_22.pdf", "Page 1", "Bhatt seen arriving at the complainant's building on this vehicle.") ]),
  rel(E.nikhil, E.bikeIntimidation, "USED", 0.4, "2026-07-01T00:00:00Z", [
    ev("Vehicle_Records_QuickCash.xlsx", "Row 4", "Also listed as an occasional rider on the pool vehicle log.") ]),

  // ================= cluster D: vehicle-theft ring (own case, no link to A/B/C) =================
  rel(E.sameer, E.ganesh, "KNOWS", 0.87, null, [
    ev("FIR_1098.pdf", "Page 2", "Pawar named as the thief working directly for Ansari.") ]),
  rel(E.ganesh, E.irfan, "KNOWS", 0.62, "2026-08-01T00:00:00Z", [
    ev("Intel_Brief_11.docx", "Para 6", "Pawar and the Pune dealer connected through a common transporter.") ]),
  rel(E.sameer, E.pawarAuto, "OWNS", 0.9, null, [
    ev("MCA_Filing_PawarAuto.pdf", "Page 1", "Ansari listed as the sole proprietor.") ]),
  rel(E.ganesh, E.stolenSwift, "USED", 0.81, "2026-07-30T02:10:00Z", [
    ev("FIR_1098.pdf", "Page 4", "ANPR and owner statement place Pawar at the theft location.") ]),
  rel(E.ganesh, E.stolenCreta, "USED", 0.76, "2026-08-05T01:40:00Z", [
    ev("FIR_1098.pdf", "Page 5", "Second theft, same method, five days later.") ]),
  rel(E.stolenSwift, E.vasaiYard, "LOCATED_AT", 0.93, "2026-07-30T05:00:00Z", [
    ev("Raid_Report_Vasai.pdf", "Page 1", "Recovered, partially dismantled, during the raid.") ]),
  rel(E.stolenCreta, E.vasaiYard, "LOCATED_AT", 0.9, "2026-08-06T00:00:00Z", [
    ev("Raid_Report_Vasai.pdf", "Page 1", "Recovered intact, engine number ground off.") ]),
  rel(E.pawarAuto, E.vasaiYard, "LOCATED_AT", 0.95, null, [
    ev("Raid_Report_Vasai.pdf", "Page 1", "Registered and physical premises match.") ]),
  rel(E.sameer, E.phoneSameer, "USED", 0.89, "2024-08-14T00:00:00Z", [
    ev("CDR_Vasai.csv", "Record #55", "Subscriber record lists S. Ansari.") ]),
  rel(E.irfan, E.phoneSameer, "COMMUNICATED_WITH", 0.58, "2026-08-02T00:00:00Z", [
    ev("CDR_Vasai.csv", "Record #61", "Calls consistent with arranging parts collection from Pune.") ]),
]

// --- cases -------------------------------------------------------------
const C = { robbery: cid(1), hawala: cid(2), loanApp: cid(3), vehicleTheft: cid(4) }

const cases = [
  { id: C.robbery, case_no: "CR-1023", title: "Andheri commercial robbery", status: "active", priority: "high",
    opened_at: "2026-08-11T09:00:00Z",
    summary: "Armed robbery at a commercial premises near Andheri East on the night of 10 August 2026. " +
      "Three subjects identified from station CCTV; a vehicle registered to Meridian Traders was recorded " +
      "leaving the area at 22:15. A fourth associate and a suspected fence have since been named." },
  { id: C.hawala, case_no: "CR-1041", title: "Cross-district value transfer channel", status: "open", priority: "critical",
    opened_at: "2026-08-14T09:00:00Z",
    summary: "Structured transfers into a Bhiwandi account via two mule accounts, each sized below the " +
      "reporting threshold. Opened after a transaction-monitoring referral; possibly linked to CR-1023 " +
      "through a shared contact." },
  { id: C.loanApp, case_no: "CR-1077", title: "Digital lending extortion racket", status: "active", priority: "high",
    opened_at: "2026-08-20T10:00:00Z",
    summary: "Complaint-driven investigation into an unlicensed digital lending app whose recovery agents " +
      "used threats and intimidation visits to collect on short-term loans. Independent of CR-1023/CR-1041." },
  { id: C.vehicleTheft, case_no: "CR-1098", title: "Vasai chop-shop vehicle theft ring", status: "under_review", priority: "medium",
    opened_at: "2026-08-06T08:00:00Z",
    summary: "Two vehicles reported stolen within a week, both traced to a dismantling yard in Vasai supplying " +
      "a spare-parts dealer in Pune. Independent of the other three cases." },
]

const caseEntities = [
  [C.robbery, E.rahul, "prime suspect"], [C.robbery, E.vikram, "suspect"], [C.robbery, E.sana, "witness"],
  [C.robbery, E.arjun, "person of interest"], [C.robbery, E.feroz, "suspect"], [C.robbery, E.anita, "suspected fence"],
  [C.robbery, E.suresh, "witness"], [C.robbery, E.vehicle, "seized"], [C.robbery, E.motorcycle, "under analysis"],
  [C.robbery, E.andheri, "scene"], [C.robbery, E.kurlaMarket, "associated location"],
  [C.robbery, E.phoneA, "under analysis"], [C.robbery, E.phoneFeroz, "under analysis"],
  [C.robbery, E.meridian, "associated entity"],
  [C.hawala, E.imran, "prime suspect"], [C.hawala, E.deepa, "suspect"], [C.hawala, E.ravi, "suspect"],
  [C.hawala, E.meena, "suspect"], [C.hawala, E.salim, "suspect"], [C.hawala, E.arjun, "person of interest"],
  [C.hawala, E.account, "subject account"], [C.hawala, E.accountMule1, "subject account"],
  [C.hawala, E.accountMule2, "subject account"], [C.hawala, E.coastline, "associated entity"],
  [C.hawala, E.bhiwandi, "premises"], [C.hawala, E.godown, "premises"], [C.hawala, E.phoneB, "under analysis"],
  [C.loanApp, E.nikhil, "prime suspect"], [C.loanApp, E.priya, "suspect"], [C.loanApp, E.kunal, "suspect"],
  [C.loanApp, E.rekha, "complainant"], [C.loanApp, E.quickcash, "associated entity"],
  [C.loanApp, E.accountQuickcash, "subject account"], [C.loanApp, E.powaiOffice, "premises"],
  [C.loanApp, E.bikeIntimidation, "under analysis"],
  [C.vehicleTheft, E.sameer, "prime suspect"], [C.vehicleTheft, E.ganesh, "suspect"],
  [C.vehicleTheft, E.irfan, "person of interest"], [C.vehicleTheft, E.pawarAuto, "associated entity"],
  [C.vehicleTheft, E.stolenSwift, "recovered"], [C.vehicleTheft, E.stolenCreta, "recovered"],
  [C.vehicleTheft, E.vasaiYard, "scene"],
].map(([case_id, entity_id, role]) => ({ case_id, entity_id, role }))

// --- documents -----------------------------------------------------------
const documents = [
  { id: did(), case_id: C.robbery, filename: "FIR_1023.pdf", kind: "fir", size_bytes: 412880, pages: 9, status: "processed", extracted_count: 23, uploaded_at: "2026-08-11T09:40:00Z" },
  { id: did(), case_id: C.robbery, filename: "Surveillance_14.pdf", kind: "surveillance", size_bytes: 1284112, pages: 6, status: "processed", extracted_count: 17, uploaded_at: "2026-08-11T11:05:00Z" },
  { id: did(), case_id: C.robbery, filename: "Vehicle_Records.xlsx", kind: "vehicle", size_bytes: 96400, pages: null, status: "processed", extracted_count: 8, uploaded_at: "2026-08-12T08:22:00Z" },
  { id: did(), case_id: C.robbery, filename: "Intel_Brief_09.docx", kind: "intelligence", size_bytes: 41220, pages: 3, status: "processed", extracted_count: 6, uploaded_at: "2026-08-13T15:00:00Z" },
  { id: did(), case_id: C.hawala, filename: "CDR_June_2026.csv", kind: "cdr", size_bytes: 3902551, pages: null, status: "processed", extracted_count: 41, uploaded_at: "2026-08-14T10:15:00Z" },
  { id: did(), case_id: C.hawala, filename: "Transactions_Q2.xlsx", kind: "financial", size_bytes: 742003, pages: null, status: "processed", extracted_count: 29, uploaded_at: "2026-08-14T10:18:00Z" },
  { id: did(), case_id: C.hawala, filename: "Intel_Brief_07.docx", kind: "intelligence", size_bytes: 58220, pages: 4, status: "processed", extracted_count: 14, uploaded_at: "2026-08-15T16:30:00Z" },
  { id: did(), case_id: C.hawala, filename: "Surveillance_19.pdf", kind: "surveillance", size_bytes: 903112, pages: 4, status: "processed", extracted_count: 9, uploaded_at: "2026-08-16T09:00:00Z" },
  { id: did(), case_id: C.loanApp, filename: "Complaint_Rekha_Iyer.pdf", kind: "complaint", size_bytes: 88210, pages: 2, status: "processed", extracted_count: 5, uploaded_at: "2026-08-20T10:30:00Z" },
  { id: did(), case_id: C.loanApp, filename: "FIR_1077.pdf", kind: "fir", size_bytes: 251900, pages: 5, status: "processed", extracted_count: 11, uploaded_at: "2026-08-20T11:00:00Z" },
  { id: did(), case_id: C.loanApp, filename: "CDR_Loan_App.csv", kind: "cdr", size_bytes: 1244890, pages: null, status: "processed", extracted_count: 19, uploaded_at: "2026-08-20T14:00:00Z" },
  { id: did(), case_id: C.loanApp, filename: "MCA_Filing_QuickCash.pdf", kind: "corporate_filing", size_bytes: 61220, pages: 2, status: "processed", extracted_count: 3, uploaded_at: "2026-08-21T09:00:00Z" },
  { id: did(), case_id: C.loanApp, filename: "Transactions_QuickCash.xlsx", kind: "financial", size_bytes: 198400, pages: null, status: "processed", extracted_count: 12, uploaded_at: "2026-08-21T09:30:00Z" },
  { id: did(), case_id: C.loanApp, filename: "Surveillance_22.pdf", kind: "surveillance", size_bytes: 512900, pages: 2, status: "processed", extracted_count: 4, uploaded_at: "2026-08-21T17:00:00Z" },
  { id: did(), case_id: C.loanApp, filename: "Vehicle_Records_QuickCash.xlsx", kind: "vehicle", size_bytes: 30880, pages: null, status: "processed", extracted_count: 2, uploaded_at: "2026-08-22T09:00:00Z" },
  { id: did(), case_id: C.vehicleTheft, filename: "FIR_1098.pdf", kind: "fir", size_bytes: 305100, pages: 6, status: "processed", extracted_count: 13, uploaded_at: "2026-08-06T09:00:00Z" },
  { id: did(), case_id: C.vehicleTheft, filename: "Raid_Report_Vasai.pdf", kind: "raid_report", size_bytes: 402200, pages: 4, status: "processed", extracted_count: 8, uploaded_at: "2026-08-07T18:00:00Z" },
  { id: did(), case_id: C.vehicleTheft, filename: "Intel_Brief_11.docx", kind: "intelligence", size_bytes: 39900, pages: 2, status: "processed", extracted_count: 4, uploaded_at: "2026-08-08T10:00:00Z" },
  { id: did(), case_id: C.vehicleTheft, filename: "CDR_Vasai.csv", kind: "cdr", size_bytes: 601200, pages: null, status: "processing", extracted_count: 0, uploaded_at: "2026-08-22T12:00:00Z" },
  { id: did(), case_id: C.vehicleTheft, filename: "MCA_Filing_PawarAuto.pdf", kind: "corporate_filing", size_bytes: 40100, pages: 1, status: "queued", extracted_count: 0, uploaded_at: "2026-08-23T08:00:00Z" },
]

// --- events ----------------------------------------------------------------
const events = [
  { id: vid(), case_id: C.robbery, entity_ids: [E.arjun, E.phoneA, E.rahul], type: "communication",
    title: "17 calls in six days",
    description: "Call volume between Arjun Patil and the handset attributed to Rahul Sharma rises sharply in the week before the incident.",
    occurred_at: "2026-08-09T09:20:00Z", location: null, source_document: "CDR_June_2026.csv", confidence: 0.93 },
  { id: vid(), case_id: C.robbery, entity_ids: [E.rahul, E.andheri], type: "location",
    title: "Rahul Sharma at Andheri East",
    description: "Present on the east concourse for roughly 40 minutes.",
    occurred_at: "2026-08-10T18:30:00Z", location: "Andheri Station (East)", source_document: "Surveillance_14.pdf", confidence: 0.78 },
  { id: vid(), case_id: C.robbery, entity_ids: [E.arjun, E.rahul, E.vikram, E.andheri], type: "meeting",
    title: "Patil meets Sharma and Rao",
    description: "22-minute meeting recorded by station CCTV; the third subject was later identified as A. Patil.",
    occurred_at: "2026-08-10T18:52:00Z", location: "Andheri Station (East)", source_document: "Surveillance_14.pdf", confidence: 0.88 },
  { id: vid(), case_id: C.robbery, entity_ids: [E.vehicle, E.andheri], type: "vehicle",
    title: "MH01AB1234 recorded leaving the area",
    description: "ANPR hit at 22:15, roughly four hours before the robbery was reported.",
    occurred_at: "2026-08-10T22:15:00Z", location: "Andheri East", source_document: "Vehicle_Records.xlsx", confidence: 0.91 },
  { id: vid(), case_id: C.robbery, entity_ids: [E.rahul, E.vikram], type: "crime",
    title: "Robbery reported, FIR 1023 registered",
    description: "Registered against unknown persons; two subjects were identified later that week.",
    occurred_at: "2026-08-11T02:40:00Z", location: "Andheri East", source_document: "FIR_1023.pdf", confidence: 0.99 },
  { id: vid(), case_id: C.robbery, entity_ids: [E.rahul, E.anita], type: "meeting",
    title: "Sharma visits a suspected fence",
    description: "Seen entering Kulkarni's electronics shop the morning after the incident; stock discrepancy later noted.",
    occurred_at: "2026-08-11T13:00:00Z", location: "Kurla Electronics Market", source_document: "Intel_Brief_09.docx", confidence: 0.58 },
  { id: vid(), case_id: C.hawala, entity_ids: [E.arjun, E.account], type: "transaction",
    title: "INR 4,80,000 credited to A/C XXXX7741",
    description: "Credit originating from a Thane branch, two days after the incident.",
    occurred_at: "2026-08-12T14:10:00Z", location: "Thane", source_document: "Transactions_Q2.xlsx", confidence: 0.9 },
  { id: vid(), case_id: C.hawala, entity_ids: [E.deepa, E.bhiwandi], type: "location",
    title: "Deepa Nair at Block C",
    description: "Vehicle logged at the warehouse gate.",
    occurred_at: "2026-08-13T10:00:00Z", location: "Bhiwandi Warehouse Block C", source_document: "Surveillance_14.pdf", confidence: 0.7 },
  { id: vid(), case_id: C.hawala, entity_ids: [E.imran, E.account], type: "transaction",
    title: "Six transfers in 48 hours",
    description: "Each transfer sized just below the reporting threshold — the pattern that triggered the referral.",
    occurred_at: "2026-08-13T11:02:00Z", location: "Bhiwandi", source_document: "Transactions_Q2.xlsx", confidence: 0.87 },
  { id: vid(), case_id: C.hawala, entity_ids: [E.deepa, E.account], type: "transaction",
    title: "Transfer authorised by the finance manager",
    description: "Authorised using Nair's credentials outside normal working hours.",
    occurred_at: "2026-08-13T16:44:00Z", location: "Bhiwandi", source_document: "Transactions_Q2.xlsx", confidence: 0.79 },
  { id: vid(), case_id: C.hawala, entity_ids: [E.arjun, E.imran], type: "intelligence",
    title: "Patil named as an intermediary",
    description: "Intelligence brief describes Patil as the contact who introduces carriers to Sheikh.",
    occurred_at: "2026-08-15T16:30:00Z", location: null, source_document: "Intel_Brief_07.docx", confidence: 0.86 },
  { id: vid(), case_id: C.hawala, entity_ids: [E.salim, E.accountMule1, E.accountMule2], type: "transaction",
    title: "Two mule accounts opened within a week",
    description: "Both accounts held by Salim Mirza, both consolidating into the primary Bhiwandi account within days of opening.",
    occurred_at: "2026-08-16T09:40:00Z", location: "Bhiwandi", source_document: "Transactions_Q2.xlsx", confidence: 0.8 },
  { id: vid(), case_id: C.loanApp, entity_ids: [E.rekha, E.priya, E.kunal], type: "complaint",
    title: "Complaint filed against QuickCash recovery agents",
    description: "Complainant reports repeated threatening calls and an intimidation visit over a defaulted short-term loan.",
    occurred_at: "2026-08-20T10:30:00Z", location: "Mumbai", source_document: "Complaint_Rekha_Iyer.pdf", confidence: 0.95 },
  { id: vid(), case_id: C.loanApp, entity_ids: [E.kunal, E.rekha, E.bikeIntimidation], type: "intimidation",
    title: "Recovery agent visits complainant's residence",
    description: "Bhatt arrives on a two-wheeler and waits outside the building for over an hour.",
    occurred_at: "2026-08-19T18:00:00Z", location: "Mumbai", source_document: "Surveillance_22.pdf", confidence: 0.81 },
  { id: vid(), case_id: C.loanApp, entity_ids: [E.rekha, E.accountQuickcash], type: "transaction",
    title: "Complainant pays under duress",
    description: "Payment matches the amount and timing described in the complaint.",
    occurred_at: "2026-08-18T20:14:00Z", location: null, source_document: "Transactions_QuickCash.xlsx", confidence: 0.88 },
  { id: vid(), case_id: C.vehicleTheft, entity_ids: [E.ganesh, E.stolenSwift], type: "crime",
    title: "Maruti Swift MH12GH3456 reported stolen",
    description: "Taken from a residential parking area overnight; no forced entry to the compound.",
    occurred_at: "2026-07-30T02:10:00Z", location: "Vasai", source_document: "FIR_1098.pdf", confidence: 0.9 },
  { id: vid(), case_id: C.vehicleTheft, entity_ids: [E.ganesh, E.stolenCreta], type: "crime",
    title: "Hyundai Creta MH14IJ7890 reported stolen",
    description: "Same method as the earlier theft, five days later.",
    occurred_at: "2026-08-05T01:40:00Z", location: "Vasai", source_document: "FIR_1098.pdf", confidence: 0.85 },
  { id: vid(), case_id: C.vehicleTheft, entity_ids: [E.stolenSwift, E.stolenCreta, E.vasaiYard, E.pawarAuto], type: "raid",
    title: "Both vehicles recovered in a single raid",
    description: "Yard raid recovers both vehicles; one partially dismantled, the other with the engine number ground off.",
    occurred_at: "2026-08-07T06:00:00Z", location: "Vasai Chop-Shop Yard", source_document: "Raid_Report_Vasai.pdf", confidence: 0.97 },
]

// --- alerts ------------------------------------------------------------
const alerts = [
  { id: aid(), case_id: C.hawala, entity_id: E.arjun, severity: "critical", type: "network_bridge",
    title: "Arjun Patil bridges two otherwise separate groups",
    description: "Every path between the CR-1023 group and the CR-1041 group runs through this entity. Removing it would split the network in two.",
    rationale: { metric: "betweenness_centrality", rank: 1, communities_bridged: 2 }, status: "new" },
  { id: aid(), case_id: C.hawala, entity_id: E.account, severity: "high", type: "unusual_transaction",
    title: "Structured credits into A/C XXXX7741",
    description: "Six credits in 48 hours against a 90-day baseline of about four per month, each sized below the reporting threshold.",
    rationale: { metric: "transaction_frequency", baseline_per_month: 4, observed_48h: 6 }, status: "reviewing" },
  { id: aid(), case_id: C.robbery, entity_id: E.phoneA, severity: "high", type: "communication_spike",
    title: "Call volume spike before the incident",
    description: "17 calls to a single number in the six days before 10 August, against a weekly mean of 3.",
    rationale: { metric: "call_frequency", weekly_mean: 3, observed: 17 }, status: "new" },
  { id: aid(), case_id: C.robbery, entity_id: E.andheri, severity: "medium", type: "shared_location",
    title: "Three subjects co-located within 25 minutes",
    description: "Sharma, Rao and Patil all placed at Andheri East on the evening of 10 August.",
    rationale: { metric: "location_cooccurrence", subjects: 3, window_minutes: 25 }, status: "new" },
  { id: aid(), case_id: C.robbery, entity_id: E.rahul, severity: "medium", type: "entity_match",
    title: '"R. Sharma" may be the same person as Rahul Sharma',
    description: "Name similarity plus a shared handset across FIR_1023.pdf and CDR_June_2026.csv. Needs an investigator's confirmation before the records are merged.",
    rationale: { metric: "entity_resolution", similarity: 0.92, signals: ["name", "phone"] }, status: "new" },
  { id: aid(), case_id: C.hawala, entity_id: E.salim, severity: "high", type: "mule_account_pattern",
    title: "Two accounts opened by the same holder within a week",
    description: "Both accounts consolidate into the primary Bhiwandi account within days of opening — a classic layering pattern.",
    rationale: { metric: "account_velocity", accounts_opened: 2, window_days: 7 }, status: "new" },
  { id: aid(), case_id: C.loanApp, entity_id: E.quickcash, severity: "critical", type: "unlicensed_lender",
    title: "QuickCash Fintech is not on the registered NBFC list",
    description: "Corporate filing shows a digital lending business with no matching licence — a strong predicate for the extortion pattern reported.",
    rationale: { metric: "regulatory_match", licence_found: false }, status: "new" },
  { id: aid(), case_id: C.loanApp, entity_id: E.kunal, severity: "high", type: "repeat_offender",
    title: "Recovery agent has two prior recorded offences",
    description: "Bhatt's prior record includes a prior intimidation complaint against a different lender.",
    rationale: { metric: "prior_offences", count: 2 }, status: "reviewing" },
  { id: aid(), case_id: C.vehicleTheft, entity_id: E.pawarAuto, severity: "high", type: "chop_shop_pattern",
    title: "Two stolen vehicles traced to the same yard within a week",
    description: "Both thefts resolve to the same premises and the same named proprietor.",
    rationale: { metric: "location_cooccurrence", vehicles: 2, window_days: 6 }, status: "confirmed" },
]

// ------------------------------------------------------------------ output --
const esc = (s) => s.replace(/'/g, "''")
const sqlArr = (arr) => `ARRAY[${arr.map((s) => `'${esc(s)}'`).join(", ")}]::text[]`
const sqlJson = (obj) => `'${esc(JSON.stringify(obj))}'::jsonb`
const sqlStr = (s) => (s === null || s === undefined ? "null" : `'${esc(s)}'`)
const sqlTs = (s) => (s === null || s === undefined ? "null" : `'${s}'`)
const sqlNum = (n) => (n === null || n === undefined ? "null" : String(n))
const sqlUuidArr = (arr) => `ARRAY[${arr.map((s) => `'${s}'::uuid`).join(", ")}]::uuid[]`

let out = []
out.push(`-- ============================================================================`)
out.push(`--  Synthetic seed data — criminal network analysis demo`)
out.push(`--  Generated file. Paste into the Supabase SQL editor AFTER supabase/schema.sql`)
out.push(`--  has been run. Safe to re-run: truncates the seven tables first.`)
out.push(`--`)
out.push(`--  Four cases, four network shapes:`)
out.push(`--    CR-1023  Andheri robbery crew            (cluster A)`)
out.push(`--    CR-1041  Cross-district value transfer   (cluster B)`)
out.push(`--             -- A and B share exactly one contact, Arjun Patil, who bridges`)
out.push(`--             them: Rahul Sharma has the highest degree, but Patil has the`)
out.push(`--             highest betweenness. That disagreement is deliberate.`)
out.push(`--    CR-1077  Digital lending extortion       (cluster C, unconnected)`)
out.push(`--    CR-1098  Vasai chop-shop vehicle theft    (cluster D, unconnected)`)
out.push(`-- ============================================================================`)
out.push(``)
out.push(`begin;`)
out.push(``)
out.push(`truncate table`)
out.push(`  public.alerts, public.events, public.documents,`)
out.push(`  public.case_entities, public.relationships, public.cases, public.entities`)
out.push(`  cascade;`)
out.push(``)

out.push(`-- ---------------------------------------------------------------- entities --`)
out.push(`insert into public.entities (id, type, name, aliases, metadata, risk_score) values`)
out.push(
  entities
    .map(
      (e) =>
        `  ('${e.id}', ${sqlStr(e.type)}, ${sqlStr(e.name)}, ${sqlArr(e.aliases)}, ${sqlJson(e.metadata)}, ${sqlNum(e.risk_score)})`
    )
    .join(",\n") + ";"
)
out.push(``)

out.push(`-- ----------------------------------------------------------- relationships --`)
out.push(`insert into public.relationships (id, source_id, target_id, type, confidence, occurred_at, evidence) values`)
out.push(
  relationships
    .map(
      (r) =>
        `  ('${r.id}', '${r.source_id}', '${r.target_id}', ${sqlStr(r.type)}, ${sqlNum(r.confidence)}, ${sqlTs(r.occurred_at)}, ${sqlJson(r.evidence)})`
    )
    .join(",\n") + ";"
)
out.push(``)

out.push(`-- ------------------------------------------------------------------- cases --`)
out.push(`insert into public.cases (id, case_no, title, status, priority, summary, opened_at) values`)
out.push(
  cases
    .map(
      (c) =>
        `  ('${c.id}', ${sqlStr(c.case_no)}, ${sqlStr(c.title)}, ${sqlStr(c.status)}, ${sqlStr(c.priority)}, ${sqlStr(c.summary)}, ${sqlTs(c.opened_at)})`
    )
    .join(",\n") + ";"
)
out.push(``)

out.push(`insert into public.case_entities (case_id, entity_id, role) values`)
out.push(
  caseEntities.map((ce) => `  ('${ce.case_id}', '${ce.entity_id}', ${sqlStr(ce.role)})`).join(",\n") + ";"
)
out.push(``)

out.push(`-- --------------------------------------------------------------- documents --`)
out.push(
  `insert into public.documents (id, case_id, filename, kind, size_bytes, pages, status, extracted_count, uploaded_at) values`
)
out.push(
  documents
    .map(
      (d) =>
        `  ('${d.id}', '${d.case_id}', ${sqlStr(d.filename)}, ${sqlStr(d.kind)}, ${sqlNum(d.size_bytes)}, ${sqlNum(d.pages)}, ${sqlStr(d.status)}, ${sqlNum(d.extracted_count)}, ${sqlTs(d.uploaded_at)})`
    )
    .join(",\n") + ";"
)
out.push(``)

out.push(`-- ------------------------------------------------------------------ events --`)
out.push(
  `insert into public.events (id, case_id, entity_ids, type, title, description, occurred_at, location, source_document, confidence) values`
)
out.push(
  events
    .map(
      (e) =>
        `  ('${e.id}', '${e.case_id}', ${sqlUuidArr(e.entity_ids)}, ${sqlStr(e.type)}, ${sqlStr(e.title)}, ${sqlStr(e.description)}, ${sqlTs(e.occurred_at)}, ${sqlStr(e.location)}, ${sqlStr(e.source_document)}, ${sqlNum(e.confidence)})`
    )
    .join(",\n") + ";"
)
out.push(``)

out.push(`-- ------------------------------------------------------------------ alerts --`)
out.push(
  `insert into public.alerts (id, case_id, entity_id, severity, type, title, description, rationale, status) values`
)
out.push(
  alerts
    .map(
      (a) =>
        `  ('${a.id}', '${a.case_id}', '${a.entity_id}', ${sqlStr(a.severity)}, ${sqlStr(a.type)}, ${sqlStr(a.title)}, ${sqlStr(a.description)}, ${sqlJson(a.rationale)}, ${sqlStr(a.status)})`
    )
    .join(",\n") + ";"
)
out.push(``)
out.push(`commit;`)
out.push(``)
out.push(`-- Sanity check --------------------------------------------------------------`)
out.push(`select`)
out.push(`  (select count(*) from public.entities)      as entities,`)
out.push(`  (select count(*) from public.relationships) as relationships,`)
out.push(`  (select count(*) from public.cases)          as cases,`)
out.push(`  (select count(*) from public.documents)      as documents,`)
out.push(`  (select count(*) from public.events)         as events,`)
out.push(`  (select count(*) from public.alerts)         as alerts;`)

// --- validation (stderr; does not affect stdout SQL) ------------------------
const entityIds = new Set(entities.map((e) => e.id))
const caseIds = new Set(cases.map((c) => c.id))
const ALLOWED_TYPES = new Set(["person","organization","phone","vehicle","location","bank_account","event"])
const errors = []

for (const e of entities) if (!ALLOWED_TYPES.has(e.type)) errors.push(`entity ${e.name}: bad type ${e.type}`)
for (const r of relationships) {
  if (!entityIds.has(r.source_id)) errors.push(`rel ${r.id}: missing source ${r.source_id}`)
  if (!entityIds.has(r.target_id)) errors.push(`rel ${r.id}: missing target ${r.target_id}`)
  if (r.source_id === r.target_id) errors.push(`rel ${r.id}: source == target`)
  if (r.confidence < 0 || r.confidence > 1) errors.push(`rel ${r.id}: confidence out of range ${r.confidence}`)
}
for (const ce of caseEntities) {
  if (!caseIds.has(ce.case_id)) errors.push(`case_entities: missing case ${ce.case_id}`)
  if (!entityIds.has(ce.entity_id)) errors.push(`case_entities: missing entity ${ce.entity_id}`)
}
for (const d of documents) if (!caseIds.has(d.case_id)) errors.push(`document ${d.filename}: missing case ${d.case_id}`)
for (const ev_ of events) {
  if (!caseIds.has(ev_.case_id)) errors.push(`event ${ev_.title}: missing case ${ev_.case_id}`)
  for (const eid_ of ev_.entity_ids) if (!entityIds.has(eid_)) errors.push(`event ${ev_.title}: missing entity ${eid_}`)
}
for (const a of alerts) {
  if (!caseIds.has(a.case_id)) errors.push(`alert ${a.title}: missing case ${a.case_id}`)
  if (a.entity_id && !entityIds.has(a.entity_id)) errors.push(`alert ${a.title}: missing entity ${a.entity_id}`)
}

// duplicate ids across all tables
const allIds = [
  ...entities.map((x) => x.id), ...relationships.map((x) => x.id), ...cases.map((x) => x.id),
  ...documents.map((x) => x.id), ...events.map((x) => x.id), ...alerts.map((x) => x.id),
]
const seen = new Set()
for (const id_ of allIds) {
  if (seen.has(id_)) errors.push(`duplicate id ${id_}`)
  seen.add(id_)
}

// --- structural check: Arjun Patil must be the sole cut vertex between the
// CR-1023 and CR-1041 clusters (the disagreement the README documents between
// degree and betweenness centrality depends on this holding). ----------------
{
  const adj = new Map()
  for (const e of entities) adj.set(e.id, new Set())
  for (const r of relationships) { adj.get(r.source_id).add(r.target_id); adj.get(r.target_id).add(r.source_id) }

  const componentsOf = (skip) => {
    const seen = new Set(), comps = []
    for (const id_ of adj.keys()) {
      if (id_ === skip || seen.has(id_)) continue
      const stack = [id_], comp = []
      seen.add(id_)
      while (stack.length) {
        const cur = stack.pop()
        comp.push(cur)
        for (const nb of adj.get(cur)) if (nb !== skip && !seen.has(nb)) { seen.add(nb); stack.push(nb) }
      }
      comps.push(comp)
    }
    return comps
  }

  const withArjun = componentsOf(null)
  const withoutArjun = componentsOf(E.arjun)
  if (withArjun.length !== 3) errors.push(`expected 3 connected components (A+B, C, D), found ${withArjun.length}`)
  if (withoutArjun.length !== 4) errors.push(`removing Arjun should split A+B into 2 (want 4 total incl. C, D), found ${withoutArjun.length}`)
  if (adj.get(E.rahul).size <= adj.get(E.arjun).size) errors.push(`Rahul's degree (${adj.get(E.rahul).size}) should exceed Arjun's (${adj.get(E.arjun).size})`)
}

console.error(`\nentities=${entities.length} relationships=${relationships.length} cases=${cases.length} documents=${documents.length} events=${events.length} alerts=${alerts.length}`)
if (errors.length) {
  console.error(`\n${errors.length} VALIDATION ERRORS — seed.sql NOT written:`)
  for (const e of errors) console.error(" -", e)
  process.exit(1)
} else {
  console.error("\nvalidation OK")
}

console.log(out.join("\n"))
