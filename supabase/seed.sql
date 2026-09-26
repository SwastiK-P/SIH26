-- ============================================================================
--  Synthetic seed data — criminal network analysis demo
--  Generated file. Paste into the Supabase SQL editor AFTER supabase/schema.sql
--  has been run. Safe to re-run: truncates the seven tables first.
--
--  Four cases, four network shapes:
--    CR-1023  Andheri robbery crew            (cluster A)
--    CR-1041  Cross-district value transfer   (cluster B)
--             -- A and B share exactly one contact, Arjun Patil, who bridges
--             them: Rahul Sharma has the highest degree, but Patil has the
--             highest betweenness. That disagreement is deliberate.
--    CR-1077  Digital lending extortion       (cluster C, unconnected)
--    CR-1098  Vasai chop-shop vehicle theft    (cluster D, unconnected)
-- ============================================================================

begin;

truncate table
  public.alerts, public.events, public.documents,
  public.case_entities, public.relationships, public.cases, public.entities
  cascade;

-- ---------------------------------------------------------------- entities --
insert into public.entities (id, type, name, aliases, metadata, risk_score) values
  ('00000000-0000-4000-8000-00000000e001', 'person', 'Rahul Sharma', ARRAY['R. Sharma', 'Rahul K. Sharma']::text[], '{"age":34,"city":"Mumbai","priors":2,"occupation":"Transport contractor"}'::jsonb, 74),
  ('00000000-0000-4000-8000-00000000e002', 'person', 'Vikram Rao', ARRAY['V. Rao']::text[], '{"age":29,"city":"Mumbai","priors":1,"occupation":"Driver"}'::jsonb, 61),
  ('00000000-0000-4000-8000-00000000e003', 'person', 'Sana Qureshi', ARRAY[]::text[], '{"age":31,"city":"Mumbai","priors":0,"occupation":"Accounts clerk"}'::jsonb, 38),
  ('00000000-0000-4000-8000-00000000e00f', 'person', 'Feroz Ansari', ARRAY['F. Ansari']::text[], '{"age":24,"city":"Mumbai","priors":1,"occupation":"Unemployed"}'::jsonb, 55),
  ('00000000-0000-4000-8000-00000000e010', 'person', 'Anita Kulkarni', ARRAY[]::text[], '{"age":52,"city":"Mumbai","priors":1,"occupation":"Electronics shop owner"}'::jsonb, 49),
  ('00000000-0000-4000-8000-00000000e011', 'person', 'Suresh Yadav', ARRAY[]::text[], '{"age":46,"city":"Mumbai","priors":0,"occupation":"Shopkeeper","note":"Witness, not a suspect"}'::jsonb, 12),
  ('00000000-0000-4000-8000-00000000e012', 'phone', '+91 90909 12121', ARRAY[]::text[], '{"operator":"Vi","circle":"Mumbai","active_since":"2025-09"}'::jsonb, 44),
  ('00000000-0000-4000-8000-00000000e013', 'vehicle', 'MH02CD5678', ARRAY[]::text[], '{"make":"Bajaj Pulsar","colour":"Black","registered_to":"Feroz Ansari"}'::jsonb, 41),
  ('00000000-0000-4000-8000-00000000e014', 'location', 'Kurla Electronics Market', ARRAY[]::text[], '{"district":"Mumbai Suburban","lat":19.0728,"lon":72.8826}'::jsonb, 33),
  ('00000000-0000-4000-8000-00000000e004', 'person', 'Arjun Patil', ARRAY['A. Patil', 'Arjun P.']::text[], '{"age":41,"city":"Thane","priors":3,"occupation":"Freight broker"}'::jsonb, 82),
  ('00000000-0000-4000-8000-00000000e005', 'person', 'Imran Sheikh', ARRAY['I. Sheikh']::text[], '{"age":45,"city":"Bhiwandi","priors":2,"occupation":"Warehouse owner"}'::jsonb, 69),
  ('00000000-0000-4000-8000-00000000e006', 'person', 'Deepa Nair', ARRAY[]::text[], '{"age":37,"city":"Bhiwandi","priors":0,"occupation":"Finance manager"}'::jsonb, 44),
  ('00000000-0000-4000-8000-00000000e015', 'person', 'Ravi Chavan', ARRAY[]::text[], '{"age":27,"city":"Bhiwandi","priors":0,"occupation":"Courier"}'::jsonb, 47),
  ('00000000-0000-4000-8000-00000000e016', 'person', 'Meena Joshi', ARRAY[]::text[], '{"age":33,"city":"Bhiwandi","priors":0,"occupation":"Courier"}'::jsonb, 39),
  ('00000000-0000-4000-8000-00000000e017', 'person', 'Salim Mirza', ARRAY[]::text[], '{"age":25,"city":"Bhiwandi","priors":1,"occupation":"Unemployed","note":"Mule account holder"}'::jsonb, 58),
  ('00000000-0000-4000-8000-00000000e007', 'organization', 'Meridian Traders', ARRAY['Meridian Trading Co.']::text[], '{"registration":"U51909MH2019PTC0","sector":"Wholesale trade","employees":11}'::jsonb, 57),
  ('00000000-0000-4000-8000-00000000e008', 'organization', 'Coastline Logistics', ARRAY['Coastline Log.']::text[], '{"registration":"U63030MH2017PTC1","sector":"Freight forwarding","employees":34}'::jsonb, 66),
  ('00000000-0000-4000-8000-00000000e009', 'phone', '+91 98765 43210', ARRAY[]::text[], '{"operator":"Airtel","circle":"Mumbai","active_since":"2024-11"}'::jsonb, 63),
  ('00000000-0000-4000-8000-00000000e00a', 'phone', '+91 99887 76655', ARRAY[]::text[], '{"operator":"Jio","circle":"Thane","active_since":"2025-06"}'::jsonb, 51),
  ('00000000-0000-4000-8000-00000000e018', 'phone', '+91 91234 56780', ARRAY[]::text[], '{"operator":"Jio","circle":"Thane","active_since":"2025-03"}'::jsonb, 36),
  ('00000000-0000-4000-8000-00000000e019', 'phone', '+91 93456 78901', ARRAY[]::text[], '{"operator":"Vi","circle":"Thane","active_since":"2025-04"}'::jsonb, 31),
  ('00000000-0000-4000-8000-00000000e00b', 'vehicle', 'MH01AB1234', ARRAY[]::text[], '{"make":"Mahindra Bolero","colour":"White","registered_to":"Meridian Traders"}'::jsonb, 58),
  ('00000000-0000-4000-8000-00000000e00c', 'location', 'Andheri Station (East)', ARRAY['Andheri Stn']::text[], '{"district":"Mumbai Suburban","lat":19.1197,"lon":72.8464}'::jsonb, 30),
  ('00000000-0000-4000-8000-00000000e00d', 'location', 'Bhiwandi Warehouse Block C', ARRAY['Block C']::text[], '{"district":"Thane","lat":19.2813,"lon":73.0483}'::jsonb, 47),
  ('00000000-0000-4000-8000-00000000e01c', 'location', 'Ghodbunder Road Godown', ARRAY[]::text[], '{"district":"Thane","lat":19.2647,"lon":72.9781}'::jsonb, 40),
  ('00000000-0000-4000-8000-00000000e00e', 'bank_account', 'A/C XXXX7741', ARRAY[]::text[], '{"bank":"Union Bank","branch":"Bhiwandi","ifsc":"UBIN0812345","opened":"2025-02"}'::jsonb, 77),
  ('00000000-0000-4000-8000-00000000e01a', 'bank_account', 'A/C XXXX2290', ARRAY[]::text[], '{"bank":"IDBI Bank","branch":"Bhiwandi","ifsc":"IBKL0001122","opened":"2026-04","holder":"Salim Mirza"}'::jsonb, 71),
  ('00000000-0000-4000-8000-00000000e01b', 'bank_account', 'A/C XXXX5567', ARRAY[]::text[], '{"bank":"Bank of Baroda","branch":"Kalyan","ifsc":"BARB0KALYAN","opened":"2026-05","holder":"Salim Mirza"}'::jsonb, 68),
  ('00000000-0000-4000-8000-00000000e01d', 'person', 'Nikhil Verma', ARRAY['N. Verma']::text[], '{"age":33,"city":"Mumbai","priors":1,"occupation":"App operator / director"}'::jsonb, 79),
  ('00000000-0000-4000-8000-00000000e01e', 'person', 'Priya Malhotra', ARRAY[]::text[], '{"age":28,"city":"Mumbai","priors":1,"occupation":"Recovery agent"}'::jsonb, 65),
  ('00000000-0000-4000-8000-00000000e01f', 'person', 'Kunal Bhatt', ARRAY[]::text[], '{"age":30,"city":"Mumbai","priors":2,"occupation":"Recovery agent"}'::jsonb, 62),
  ('00000000-0000-4000-8000-00000000e020', 'person', 'Rekha Iyer', ARRAY[]::text[], '{"age":41,"city":"Mumbai","priors":0,"occupation":"Schoolteacher","note":"Complainant / victim"}'::jsonb, 4),
  ('00000000-0000-4000-8000-00000000e021', 'organization', 'QuickCash Fintech Pvt Ltd', ARRAY['QuickCash']::text[], '{"registration":"U65999MH2024PTC2","sector":"Digital lending","employees":6,"note":"Unlicensed lender"}'::jsonb, 84),
  ('00000000-0000-4000-8000-00000000e022', 'phone', '+91 95555 11122', ARRAY[]::text[], '{"operator":"Airtel","circle":"Mumbai","active_since":"2025-01"}'::jsonb, 70),
  ('00000000-0000-4000-8000-00000000e023', 'phone', '+91 95555 33344', ARRAY[]::text[], '{"operator":"Jio","circle":"Mumbai","active_since":"2025-02"}'::jsonb, 60),
  ('00000000-0000-4000-8000-00000000e024', 'bank_account', 'A/C XXXX9081', ARRAY[]::text[], '{"bank":"Yes Bank","branch":"Powai","ifsc":"YESB0000456","opened":"2025-01"}'::jsonb, 80),
  ('00000000-0000-4000-8000-00000000e025', 'location', 'Powai Business Park, Unit 402', ARRAY[]::text[], '{"district":"Mumbai Suburban","lat":19.1176,"lon":72.906}'::jsonb, 52),
  ('00000000-0000-4000-8000-00000000e026', 'vehicle', 'MH04EF9012', ARRAY[]::text[], '{"make":"Honda Activa","colour":"Grey","registered_to":"Kunal Bhatt"}'::jsonb, 45),
  ('00000000-0000-4000-8000-00000000e027', 'person', 'Sameer Ansari', ARRAY['S. Ansari']::text[], '{"age":39,"city":"Vasai","priors":3,"occupation":"Chop-shop owner"}'::jsonb, 71),
  ('00000000-0000-4000-8000-00000000e028', 'person', 'Ganesh Pawar', ARRAY[]::text[], '{"age":26,"city":"Vasai","priors":2,"occupation":"Vehicle thief"}'::jsonb, 64),
  ('00000000-0000-4000-8000-00000000e029', 'person', 'Irfan Shaikh', ARRAY['I. Shaikh']::text[], '{"age":44,"city":"Pune","priors":1,"occupation":"Spare-parts dealer"}'::jsonb, 53),
  ('00000000-0000-4000-8000-00000000e02a', 'organization', 'Pawar Auto Parts', ARRAY[]::text[], '{"registration":"U50300MH2021PTC3","sector":"Auto parts trade","employees":4}'::jsonb, 62),
  ('00000000-0000-4000-8000-00000000e02b', 'vehicle', 'MH12GH3456', ARRAY[]::text[], '{"make":"Maruti Suzuki Swift","colour":"Red","status":"Reported stolen 2026-07-30"}'::jsonb, 66),
  ('00000000-0000-4000-8000-00000000e02c', 'vehicle', 'MH14IJ7890', ARRAY[]::text[], '{"make":"Hyundai Creta","colour":"White","status":"Reported stolen 2026-08-05"}'::jsonb, 66),
  ('00000000-0000-4000-8000-00000000e02d', 'location', 'Vasai Chop-Shop Yard', ARRAY[]::text[], '{"district":"Palghar","lat":19.3919,"lon":72.8397}'::jsonb, 73),
  ('00000000-0000-4000-8000-00000000e02e', 'phone', '+91 96666 22233', ARRAY[]::text[], '{"operator":"Jio","circle":"Vasai","active_since":"2024-08"}'::jsonb, 55);

-- ----------------------------------------------------------- relationships --
insert into public.relationships (id, source_id, target_id, type, confidence, occurred_at, evidence) values
  ('00000000-0000-4000-9000-000000000001', '00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000e002', 'KNOWS', 0.94, '2026-08-02T00:00:00Z', '[{"document":"FIR_1023.pdf","ref":"Page 4","snippet":"Named Vikram Rao as a long-standing associate of Rahul Sharma."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000002', '00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000e003', 'KNOWS', 0.81, '2026-07-28T00:00:00Z', '[{"document":"FIR_1023.pdf","ref":"Page 6","snippet":"Sana Qureshi handled accounts for the same firm as Sharma."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000003', '00000000-0000-4000-8000-00000000e002', '00000000-0000-4000-8000-00000000e003', 'KNOWS', 0.66, '2026-08-04T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #14022","snippet":"3 calls exchanged, total 11m 20s."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000004', '00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000e009', 'USED', 0.97, '2026-06-01T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #23891","snippet":"Subscriber record lists R. Sharma against 98765 43210."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000005', '00000000-0000-4000-8000-00000000e002', '00000000-0000-4000-8000-00000000e009', 'COMMUNICATED_WITH', 0.74, '2026-08-08T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #14108","snippet":"9 calls to the Sharma handset in the fortnight before the incident."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000006', '00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000e00b', 'USED', 0.89, '2026-08-10T18:30:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 3","snippet":"Sharma seen at the wheel of MH01AB1234."},{"document":"Vehicle_Records.xlsx","ref":"Row 88","snippet":"Challan issued 10 Aug, driver named as R. Sharma."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000007', '00000000-0000-4000-8000-00000000e002', '00000000-0000-4000-8000-00000000e00b', 'USED', 0.83, '2026-08-05T00:00:00Z', '[{"document":"Vehicle_Records.xlsx","ref":"Row 72","snippet":"Logged as the named driver on two earlier trips."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000008', '00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000e007', 'WORKED_FOR', 0.85, null, '[{"document":"FIR_1023.pdf","ref":"Page 2","snippet":"Employed as a transport contractor by Meridian Traders."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000009', '00000000-0000-4000-8000-00000000e003', '00000000-0000-4000-8000-00000000e007', 'WORKED_FOR', 0.92, null, '[{"document":"FIR_1023.pdf","ref":"Page 6","snippet":"Qureshi confirmed as accounts clerk at Meridian Traders."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000000a', '00000000-0000-4000-8000-00000000e00b', '00000000-0000-4000-8000-00000000e00c', 'LOCATED_AT', 0.91, '2026-08-10T22:15:00Z', '[{"document":"Vehicle_Records.xlsx","ref":"Row 91","snippet":"ANPR hit, Andheri East, 22:15 on 10 Aug."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000000b', '00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000e00c', 'VISITED', 0.78, '2026-08-10T18:30:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 2","snippet":"Subject present on the east concourse for about 40 minutes."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000000c', '00000000-0000-4000-8000-00000000e002', '00000000-0000-4000-8000-00000000e00c', 'VISITED', 0.72, '2026-08-10T18:35:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 2","snippet":"Second subject joined at 18:35."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000000d', '00000000-0000-4000-8000-00000000e003', '00000000-0000-4000-8000-00000000e00c', 'VISITED', 0.64, '2026-08-07T00:00:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 4","snippet":"Observed on the east concourse on an earlier date; no contact recorded."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000000e', '00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000e00f', 'KNOWS', 0.7, '2026-08-01T00:00:00Z', '[{"document":"Intel_Brief_09.docx","ref":"Para 3","snippet":"Ansari described as a lookout Sharma has used before."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000000f', '00000000-0000-4000-8000-00000000e00f', '00000000-0000-4000-8000-00000000e012', 'USED', 0.88, '2025-09-20T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #14290","snippet":"Subscriber record lists F. Ansari."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000010', '00000000-0000-4000-8000-00000000e00f', '00000000-0000-4000-8000-00000000e009', 'COMMUNICATED_WITH', 0.69, '2026-08-10T17:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #14301","snippet":"5 calls to the Sharma handset in the hour before the meeting."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000011', '00000000-0000-4000-8000-00000000e00f', '00000000-0000-4000-8000-00000000e00c', 'VISITED', 0.6, '2026-08-10T18:00:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 3","snippet":"Unidentified male loitering near the east exit; later matched to Ansari."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000012', '00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000e010', 'MET_WITH', 0.58, '2026-08-11T13:00:00Z', '[{"document":"Intel_Brief_09.docx","ref":"Para 5","snippet":"Sharma seen entering Kulkarni''s shop the morning after the incident."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000013', '00000000-0000-4000-8000-00000000e010', '00000000-0000-4000-8000-00000000e014', 'LOCATED_AT', 0.95, null, '[{"document":"Intel_Brief_09.docx","ref":"Para 4","snippet":"Registered shop address, Kurla Electronics Market."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000014', '00000000-0000-4000-8000-00000000e002', '00000000-0000-4000-8000-00000000e013', 'USED', 0.62, '2026-08-09T00:00:00Z', '[{"document":"Vehicle_Records.xlsx","ref":"Row 95","snippet":"Registered to Ansari; logged on a recce pass the evening before."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000015', '00000000-0000-4000-8000-00000000e011', '00000000-0000-4000-8000-00000000e001', 'IDENTIFIED', 0.41, '2026-08-11T09:20:00Z', '[{"document":"FIR_1023.pdf","ref":"Page 8","snippet":"Shopkeeper''s statement tentatively identifies one subject from a photo array."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000016', '00000000-0000-4000-8000-00000000e004', '00000000-0000-4000-8000-00000000e001', 'MET_WITH', 0.88, '2026-08-10T18:52:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 2","snippet":"Third subject identified as A. Patil; meeting lasted 22 minutes."},{"document":"FIR_1023.pdf","ref":"Page 7","snippet":"A Thane-based broker was named but not traced."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000017', '00000000-0000-4000-8000-00000000e004', '00000000-0000-4000-8000-00000000e009', 'COMMUNICATED_WITH', 0.93, '2026-08-09T09:20:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #23891","snippet":"17 calls in the 6 days before 10 Aug."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000018', '00000000-0000-4000-8000-00000000e004', '00000000-0000-4000-8000-00000000e00c', 'VISITED', 0.75, '2026-08-10T18:45:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 2","snippet":"Arrived separately at 18:45 and left by the north exit."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000019', '00000000-0000-4000-8000-00000000e004', '00000000-0000-4000-8000-00000000e005', 'KNOWS', 0.86, '2026-07-19T00:00:00Z', '[{"document":"Intel_Brief_07.docx","ref":"Para 12","snippet":"Patil described as the fixer who introduces carriers to Sheikh."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000001a', '00000000-0000-4000-8000-00000000e004', '00000000-0000-4000-8000-00000000e00e', 'TRANSFERRED_TO', 0.9, '2026-08-12T14:10:00Z', '[{"document":"Transactions_Q2.xlsx","ref":"Row 214","snippet":"INR 4,80,000 credited from a Thane branch on 12 Aug."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000001b', '00000000-0000-4000-8000-00000000e005', '00000000-0000-4000-8000-00000000e006', 'KNOWS', 0.9, null, '[{"document":"Intel_Brief_07.docx","ref":"Para 14","snippet":"Nair reports directly to Sheikh."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000001c', '00000000-0000-4000-8000-00000000e005', '00000000-0000-4000-8000-00000000e00a', 'USED', 0.95, '2026-06-15T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #31007","snippet":"Subscriber record lists I. Sheikh."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000001d', '00000000-0000-4000-8000-00000000e006', '00000000-0000-4000-8000-00000000e00a', 'COMMUNICATED_WITH', 0.68, '2026-08-13T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #31044","snippet":"Regular short calls during warehouse operating hours."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000001e', '00000000-0000-4000-8000-00000000e005', '00000000-0000-4000-8000-00000000e008', 'WORKED_FOR', 0.93, null, '[{"document":"Intel_Brief_07.docx","ref":"Para 9","snippet":"Sheikh holds a controlling interest in Coastline Logistics."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000001f', '00000000-0000-4000-8000-00000000e006', '00000000-0000-4000-8000-00000000e008', 'WORKED_FOR', 0.96, null, '[{"document":"Intel_Brief_07.docx","ref":"Para 14","snippet":"Nair listed as finance manager."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000020', '00000000-0000-4000-8000-00000000e005', '00000000-0000-4000-8000-00000000e00e', 'TRANSFERRED_TO', 0.87, '2026-08-13T11:02:00Z', '[{"document":"Transactions_Q2.xlsx","ref":"Row 219","snippet":"Six transfers in 48 hours, all under the reporting threshold."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000021', '00000000-0000-4000-8000-00000000e006', '00000000-0000-4000-8000-00000000e00e', 'TRANSFERRED_TO', 0.79, '2026-08-13T16:44:00Z', '[{"document":"Transactions_Q2.xlsx","ref":"Row 226","snippet":"Authorised with the finance manager''s credentials."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000022', '00000000-0000-4000-8000-00000000e006', '00000000-0000-4000-8000-00000000e00d', 'VISITED', 0.7, '2026-08-13T10:00:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 5","snippet":"Vehicle logged at the Block C gate."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000023', '00000000-0000-4000-8000-00000000e005', '00000000-0000-4000-8000-00000000e00d', 'VISITED', 0.76, '2026-08-13T09:10:00Z', '[{"document":"Surveillance_14.pdf","ref":"Page 5","snippet":"Present at Block C for most of the working day."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000024', '00000000-0000-4000-8000-00000000e008', '00000000-0000-4000-8000-00000000e00d', 'LOCATED_AT', 0.98, null, '[{"document":"Intel_Brief_07.docx","ref":"Para 9","snippet":"Registered operating address."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000025', '00000000-0000-4000-8000-00000000e005', '00000000-0000-4000-8000-00000000e015', 'KNOWS', 0.84, null, '[{"document":"Intel_Brief_07.docx","ref":"Para 16","snippet":"Chavan named as a regular courier for Sheikh''s consignments."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000026', '00000000-0000-4000-8000-00000000e005', '00000000-0000-4000-8000-00000000e016', 'KNOWS', 0.8, null, '[{"document":"Intel_Brief_07.docx","ref":"Para 16","snippet":"Joshi named alongside Chavan as a second courier."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000027', '00000000-0000-4000-8000-00000000e015', '00000000-0000-4000-8000-00000000e018', 'USED', 0.9, '2025-03-11T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #31102","snippet":"Subscriber record lists R. Chavan."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000028', '00000000-0000-4000-8000-00000000e016', '00000000-0000-4000-8000-00000000e019', 'USED', 0.88, '2025-04-02T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #31115","snippet":"Subscriber record lists M. Joshi."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000029', '00000000-0000-4000-8000-00000000e015', '00000000-0000-4000-8000-00000000e00a', 'COMMUNICATED_WITH', 0.71, '2026-08-12T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #31120","snippet":"Daily calls to the Sheikh handset during the transfer window."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000002a', '00000000-0000-4000-8000-00000000e016', '00000000-0000-4000-8000-00000000e00a', 'COMMUNICATED_WITH', 0.67, '2026-08-12T00:00:00Z', '[{"document":"CDR_June_2026.csv","ref":"Record #31126","snippet":"Daily calls to the Sheikh handset during the transfer window."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000002b', '00000000-0000-4000-8000-00000000e006', '00000000-0000-4000-8000-00000000e017', 'KNOWS', 0.73, '2026-07-30T00:00:00Z', '[{"document":"Intel_Brief_07.docx","ref":"Para 18","snippet":"Nair introduced Mirza to open two accounts for the channel."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000002c', '00000000-0000-4000-8000-00000000e017', '00000000-0000-4000-8000-00000000e01a', 'TRANSFERRED_TO', 0.85, '2026-08-14T10:05:00Z', '[{"document":"Transactions_Q2.xlsx","ref":"Row 241","snippet":"Account opened in Mirza''s name, first credit within a week."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000002d', '00000000-0000-4000-8000-00000000e017', '00000000-0000-4000-8000-00000000e01b', 'TRANSFERRED_TO', 0.82, '2026-08-16T09:40:00Z', '[{"document":"Transactions_Q2.xlsx","ref":"Row 248","snippet":"Second mule account, same holder, different bank."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000002e', '00000000-0000-4000-8000-00000000e01a', '00000000-0000-4000-8000-00000000e00e', 'TRANSFERRED_TO', 0.77, '2026-08-15T00:00:00Z', '[{"document":"Transactions_Q2.xlsx","ref":"Row 244","snippet":"Consolidating transfer to the primary Bhiwandi account."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000002f', '00000000-0000-4000-8000-00000000e01b', '00000000-0000-4000-8000-00000000e00e', 'TRANSFERRED_TO', 0.74, '2026-08-17T00:00:00Z', '[{"document":"Transactions_Q2.xlsx","ref":"Row 251","snippet":"Consolidating transfer to the primary Bhiwandi account."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000030', '00000000-0000-4000-8000-00000000e015', '00000000-0000-4000-8000-00000000e01c', 'VISITED', 0.69, '2026-08-14T00:00:00Z', '[{"document":"Surveillance_19.pdf","ref":"Page 2","snippet":"Logged dropping a consignment at the Ghodbunder Road site."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000031', '00000000-0000-4000-8000-00000000e016', '00000000-0000-4000-8000-00000000e01c', 'VISITED', 0.65, '2026-08-15T00:00:00Z', '[{"document":"Surveillance_19.pdf","ref":"Page 3","snippet":"Logged at the same site the following day."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000032', '00000000-0000-4000-8000-00000000e008', '00000000-0000-4000-8000-00000000e01c', 'LOCATED_AT', 0.7, null, '[{"document":"Intel_Brief_07.docx","ref":"Para 20","snippet":"Secondary, unregistered storage site linked to Coastline Logistics."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000033', '00000000-0000-4000-8000-00000000e01d', '00000000-0000-4000-8000-00000000e01e', 'KNOWS', 0.9, null, '[{"document":"FIR_1077.pdf","ref":"Page 3","snippet":"Malhotra named as a recovery agent reporting to Verma."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000034', '00000000-0000-4000-8000-00000000e01d', '00000000-0000-4000-8000-00000000e01f', 'KNOWS', 0.88, null, '[{"document":"FIR_1077.pdf","ref":"Page 3","snippet":"Bhatt named as a second recovery agent reporting to Verma."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000035', '00000000-0000-4000-8000-00000000e01e', '00000000-0000-4000-8000-00000000e01f', 'KNOWS', 0.79, '2026-08-20T00:00:00Z', '[{"document":"CDR_Loan_App.csv","ref":"Record #802","snippet":"Frequent contact consistent with joint recovery visits."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000036', '00000000-0000-4000-8000-00000000e01d', '00000000-0000-4000-8000-00000000e021', 'WORKED_FOR', 0.97, null, '[{"document":"MCA_Filing_QuickCash.pdf","ref":"Page 1","snippet":"Verma listed as director of QuickCash Fintech Pvt Ltd."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000037', '00000000-0000-4000-8000-00000000e01e', '00000000-0000-4000-8000-00000000e021', 'WORKED_FOR', 0.85, null, '[{"document":"Complaint_Rekha_Iyer.pdf","ref":"Page 2","snippet":"Complainant names Malhotra as a QuickCash collections agent."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000038', '00000000-0000-4000-8000-00000000e01f', '00000000-0000-4000-8000-00000000e021', 'WORKED_FOR', 0.85, null, '[{"document":"Complaint_Rekha_Iyer.pdf","ref":"Page 2","snippet":"Complainant names Bhatt as a QuickCash collections agent."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000039', '00000000-0000-4000-8000-00000000e01d', '00000000-0000-4000-8000-00000000e022', 'USED', 0.93, '2025-01-15T00:00:00Z', '[{"document":"CDR_Loan_App.csv","ref":"Record #700","snippet":"Subscriber record lists N. Verma."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000003a', '00000000-0000-4000-8000-00000000e01e', '00000000-0000-4000-8000-00000000e023', 'USED', 0.9, '2025-02-10T00:00:00Z', '[{"document":"CDR_Loan_App.csv","ref":"Record #706","snippet":"Subscriber record lists P. Malhotra."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000003b', '00000000-0000-4000-8000-00000000e021', '00000000-0000-4000-8000-00000000e025', 'LOCATED_AT', 0.96, null, '[{"document":"MCA_Filing_QuickCash.pdf","ref":"Page 1","snippet":"Registered office address."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000003c', '00000000-0000-4000-8000-00000000e021', '00000000-0000-4000-8000-00000000e024', 'TRANSFERRED_TO', 0.88, null, '[{"document":"Transactions_QuickCash.xlsx","ref":"Row 12","snippet":"Collections account named on the loan agreement template."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000003d', '00000000-0000-4000-8000-00000000e020', '00000000-0000-4000-8000-00000000e024', 'TRANSFERRED_TO', 0.91, '2026-08-18T20:14:00Z', '[{"document":"Transactions_QuickCash.xlsx","ref":"Row 55","snippet":"Payment matching the amount cited in the complaint."},{"document":"Complaint_Rekha_Iyer.pdf","ref":"Page 1","snippet":"Complainant states she paid after repeated threatening calls."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000003e', '00000000-0000-4000-8000-00000000e01e', '00000000-0000-4000-8000-00000000e020', 'THREATENED', 0.83, '2026-08-18T19:40:00Z', '[{"document":"Complaint_Rekha_Iyer.pdf","ref":"Page 1","snippet":"Complainant identifies Malhotra''s voice from a recorded call."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000003f', '00000000-0000-4000-8000-00000000e01f', '00000000-0000-4000-8000-00000000e020', 'THREATENED', 0.77, '2026-08-19T08:15:00Z', '[{"document":"Complaint_Rekha_Iyer.pdf","ref":"Page 2","snippet":"Second call, complainant recognises the same threats repeated."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000040', '00000000-0000-4000-8000-00000000e01f', '00000000-0000-4000-8000-00000000e026', 'USED', 0.72, '2026-08-19T18:00:00Z', '[{"document":"Surveillance_22.pdf","ref":"Page 1","snippet":"Bhatt seen arriving at the complainant''s building on this vehicle."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000041', '00000000-0000-4000-8000-00000000e01d', '00000000-0000-4000-8000-00000000e026', 'USED', 0.4, '2026-07-01T00:00:00Z', '[{"document":"Vehicle_Records_QuickCash.xlsx","ref":"Row 4","snippet":"Also listed as an occasional rider on the pool vehicle log."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000042', '00000000-0000-4000-8000-00000000e027', '00000000-0000-4000-8000-00000000e028', 'KNOWS', 0.87, null, '[{"document":"FIR_1098.pdf","ref":"Page 2","snippet":"Pawar named as the thief working directly for Ansari."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000043', '00000000-0000-4000-8000-00000000e028', '00000000-0000-4000-8000-00000000e029', 'KNOWS', 0.62, '2026-08-01T00:00:00Z', '[{"document":"Intel_Brief_11.docx","ref":"Para 6","snippet":"Pawar and the Pune dealer connected through a common transporter."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000044', '00000000-0000-4000-8000-00000000e027', '00000000-0000-4000-8000-00000000e02a', 'OWNS', 0.9, null, '[{"document":"MCA_Filing_PawarAuto.pdf","ref":"Page 1","snippet":"Ansari listed as the sole proprietor."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000045', '00000000-0000-4000-8000-00000000e028', '00000000-0000-4000-8000-00000000e02b', 'USED', 0.81, '2026-07-30T02:10:00Z', '[{"document":"FIR_1098.pdf","ref":"Page 4","snippet":"ANPR and owner statement place Pawar at the theft location."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000046', '00000000-0000-4000-8000-00000000e028', '00000000-0000-4000-8000-00000000e02c', 'USED', 0.76, '2026-08-05T01:40:00Z', '[{"document":"FIR_1098.pdf","ref":"Page 5","snippet":"Second theft, same method, five days later."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000047', '00000000-0000-4000-8000-00000000e02b', '00000000-0000-4000-8000-00000000e02d', 'LOCATED_AT', 0.93, '2026-07-30T05:00:00Z', '[{"document":"Raid_Report_Vasai.pdf","ref":"Page 1","snippet":"Recovered, partially dismantled, during the raid."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000048', '00000000-0000-4000-8000-00000000e02c', '00000000-0000-4000-8000-00000000e02d', 'LOCATED_AT', 0.9, '2026-08-06T00:00:00Z', '[{"document":"Raid_Report_Vasai.pdf","ref":"Page 1","snippet":"Recovered intact, engine number ground off."}]'::jsonb),
  ('00000000-0000-4000-9000-000000000049', '00000000-0000-4000-8000-00000000e02a', '00000000-0000-4000-8000-00000000e02d', 'LOCATED_AT', 0.95, null, '[{"document":"Raid_Report_Vasai.pdf","ref":"Page 1","snippet":"Registered and physical premises match."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000004a', '00000000-0000-4000-8000-00000000e027', '00000000-0000-4000-8000-00000000e02e', 'USED', 0.89, '2024-08-14T00:00:00Z', '[{"document":"CDR_Vasai.csv","ref":"Record #55","snippet":"Subscriber record lists S. Ansari."}]'::jsonb),
  ('00000000-0000-4000-9000-00000000004b', '00000000-0000-4000-8000-00000000e029', '00000000-0000-4000-8000-00000000e02e', 'COMMUNICATED_WITH', 0.58, '2026-08-02T00:00:00Z', '[{"document":"CDR_Vasai.csv","ref":"Record #61","snippet":"Calls consistent with arranging parts collection from Pune."}]'::jsonb);

-- ------------------------------------------------------------------- cases --
insert into public.cases (id, case_no, title, status, priority, summary, opened_at) values
  ('00000000-0000-4000-8000-00000000c001', 'CR-1023', 'Andheri commercial robbery', 'active', 'high', 'Armed robbery at a commercial premises near Andheri East on the night of 10 August 2026. Three subjects identified from station CCTV; a vehicle registered to Meridian Traders was recorded leaving the area at 22:15. A fourth associate and a suspected fence have since been named.', '2026-08-11T09:00:00Z'),
  ('00000000-0000-4000-8000-00000000c002', 'CR-1041', 'Cross-district value transfer channel', 'open', 'critical', 'Structured transfers into a Bhiwandi account via two mule accounts, each sized below the reporting threshold. Opened after a transaction-monitoring referral; possibly linked to CR-1023 through a shared contact.', '2026-08-14T09:00:00Z'),
  ('00000000-0000-4000-8000-00000000c003', 'CR-1077', 'Digital lending extortion racket', 'active', 'high', 'Complaint-driven investigation into an unlicensed digital lending app whose recovery agents used threats and intimidation visits to collect on short-term loans. Independent of CR-1023/CR-1041.', '2026-08-20T10:00:00Z'),
  ('00000000-0000-4000-8000-00000000c004', 'CR-1098', 'Vasai chop-shop vehicle theft ring', 'under_review', 'medium', 'Two vehicles reported stolen within a week, both traced to a dismantling yard in Vasai supplying a spare-parts dealer in Pune. Independent of the other three cases.', '2026-08-06T08:00:00Z');

insert into public.case_entities (case_id, entity_id, role) values
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e001', 'prime suspect'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e002', 'suspect'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e003', 'witness'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e004', 'person of interest'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e00f', 'suspect'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e010', 'suspected fence'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e011', 'witness'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e00b', 'seized'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e013', 'under analysis'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e00c', 'scene'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e014', 'associated location'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e009', 'under analysis'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e012', 'under analysis'),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e007', 'associated entity'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e005', 'prime suspect'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e006', 'suspect'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e015', 'suspect'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e016', 'suspect'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e017', 'suspect'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e004', 'person of interest'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e00e', 'subject account'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e01a', 'subject account'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e01b', 'subject account'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e008', 'associated entity'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e00d', 'premises'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e01c', 'premises'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e00a', 'under analysis'),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e01d', 'prime suspect'),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e01e', 'suspect'),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e01f', 'suspect'),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e020', 'complainant'),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e021', 'associated entity'),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e024', 'subject account'),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e025', 'premises'),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e026', 'under analysis'),
  ('00000000-0000-4000-8000-00000000c004', '00000000-0000-4000-8000-00000000e027', 'prime suspect'),
  ('00000000-0000-4000-8000-00000000c004', '00000000-0000-4000-8000-00000000e028', 'suspect'),
  ('00000000-0000-4000-8000-00000000c004', '00000000-0000-4000-8000-00000000e029', 'person of interest'),
  ('00000000-0000-4000-8000-00000000c004', '00000000-0000-4000-8000-00000000e02a', 'associated entity'),
  ('00000000-0000-4000-8000-00000000c004', '00000000-0000-4000-8000-00000000e02b', 'recovered'),
  ('00000000-0000-4000-8000-00000000c004', '00000000-0000-4000-8000-00000000e02c', 'recovered'),
  ('00000000-0000-4000-8000-00000000c004', '00000000-0000-4000-8000-00000000e02d', 'scene');

-- --------------------------------------------------------------- documents --
insert into public.documents (id, case_id, filename, kind, size_bytes, pages, status, extracted_count, uploaded_at) values
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-00000000c001', 'FIR_1023.pdf', 'fir', 412880, 9, 'processed', 23, '2026-08-11T09:40:00Z'),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-8000-00000000c001', 'Surveillance_14.pdf', 'surveillance', 1284112, 6, 'processed', 17, '2026-08-11T11:05:00Z'),
  ('00000000-0000-4000-a000-000000000003', '00000000-0000-4000-8000-00000000c001', 'Vehicle_Records.xlsx', 'vehicle', 96400, null, 'processed', 8, '2026-08-12T08:22:00Z'),
  ('00000000-0000-4000-a000-000000000004', '00000000-0000-4000-8000-00000000c001', 'Intel_Brief_09.docx', 'intelligence', 41220, 3, 'processed', 6, '2026-08-13T15:00:00Z'),
  ('00000000-0000-4000-a000-000000000005', '00000000-0000-4000-8000-00000000c002', 'CDR_June_2026.csv', 'cdr', 3902551, null, 'processed', 41, '2026-08-14T10:15:00Z'),
  ('00000000-0000-4000-a000-000000000006', '00000000-0000-4000-8000-00000000c002', 'Transactions_Q2.xlsx', 'financial', 742003, null, 'processed', 29, '2026-08-14T10:18:00Z'),
  ('00000000-0000-4000-a000-000000000007', '00000000-0000-4000-8000-00000000c002', 'Intel_Brief_07.docx', 'intelligence', 58220, 4, 'processed', 14, '2026-08-15T16:30:00Z'),
  ('00000000-0000-4000-a000-000000000008', '00000000-0000-4000-8000-00000000c002', 'Surveillance_19.pdf', 'surveillance', 903112, 4, 'processed', 9, '2026-08-16T09:00:00Z'),
  ('00000000-0000-4000-a000-000000000009', '00000000-0000-4000-8000-00000000c003', 'Complaint_Rekha_Iyer.pdf', 'complaint', 88210, 2, 'processed', 5, '2026-08-20T10:30:00Z'),
  ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-8000-00000000c003', 'FIR_1077.pdf', 'fir', 251900, 5, 'processed', 11, '2026-08-20T11:00:00Z'),
  ('00000000-0000-4000-a000-00000000000b', '00000000-0000-4000-8000-00000000c003', 'CDR_Loan_App.csv', 'cdr', 1244890, null, 'processed', 19, '2026-08-20T14:00:00Z'),
  ('00000000-0000-4000-a000-00000000000c', '00000000-0000-4000-8000-00000000c003', 'MCA_Filing_QuickCash.pdf', 'corporate_filing', 61220, 2, 'processed', 3, '2026-08-21T09:00:00Z'),
  ('00000000-0000-4000-a000-00000000000d', '00000000-0000-4000-8000-00000000c003', 'Transactions_QuickCash.xlsx', 'financial', 198400, null, 'processed', 12, '2026-08-21T09:30:00Z'),
  ('00000000-0000-4000-a000-00000000000e', '00000000-0000-4000-8000-00000000c003', 'Surveillance_22.pdf', 'surveillance', 512900, 2, 'processed', 4, '2026-08-21T17:00:00Z'),
  ('00000000-0000-4000-a000-00000000000f', '00000000-0000-4000-8000-00000000c003', 'Vehicle_Records_QuickCash.xlsx', 'vehicle', 30880, null, 'processed', 2, '2026-08-22T09:00:00Z'),
  ('00000000-0000-4000-a000-000000000010', '00000000-0000-4000-8000-00000000c004', 'FIR_1098.pdf', 'fir', 305100, 6, 'processed', 13, '2026-08-06T09:00:00Z'),
  ('00000000-0000-4000-a000-000000000011', '00000000-0000-4000-8000-00000000c004', 'Raid_Report_Vasai.pdf', 'raid_report', 402200, 4, 'processed', 8, '2026-08-07T18:00:00Z'),
  ('00000000-0000-4000-a000-000000000012', '00000000-0000-4000-8000-00000000c004', 'Intel_Brief_11.docx', 'intelligence', 39900, 2, 'processed', 4, '2026-08-08T10:00:00Z'),
  ('00000000-0000-4000-a000-000000000013', '00000000-0000-4000-8000-00000000c004', 'CDR_Vasai.csv', 'cdr', 601200, null, 'processing', 0, '2026-08-22T12:00:00Z'),
  ('00000000-0000-4000-a000-000000000014', '00000000-0000-4000-8000-00000000c004', 'MCA_Filing_PawarAuto.pdf', 'corporate_filing', 40100, 1, 'queued', 0, '2026-08-23T08:00:00Z');

-- ------------------------------------------------------------------ events --
insert into public.events (id, case_id, entity_ids, type, title, description, occurred_at, location, source_document, confidence) values
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-8000-00000000c001', ARRAY['00000000-0000-4000-8000-00000000e004'::uuid, '00000000-0000-4000-8000-00000000e009'::uuid, '00000000-0000-4000-8000-00000000e001'::uuid]::uuid[], 'communication', '17 calls in six days', 'Call volume between Arjun Patil and the handset attributed to Rahul Sharma rises sharply in the week before the incident.', '2026-08-09T09:20:00Z', null, 'CDR_June_2026.csv', 0.93),
  ('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-8000-00000000c001', ARRAY['00000000-0000-4000-8000-00000000e001'::uuid, '00000000-0000-4000-8000-00000000e00c'::uuid]::uuid[], 'location', 'Rahul Sharma at Andheri East', 'Present on the east concourse for roughly 40 minutes.', '2026-08-10T18:30:00Z', 'Andheri Station (East)', 'Surveillance_14.pdf', 0.78),
  ('00000000-0000-4000-b000-000000000003', '00000000-0000-4000-8000-00000000c001', ARRAY['00000000-0000-4000-8000-00000000e004'::uuid, '00000000-0000-4000-8000-00000000e001'::uuid, '00000000-0000-4000-8000-00000000e002'::uuid, '00000000-0000-4000-8000-00000000e00c'::uuid]::uuid[], 'meeting', 'Patil meets Sharma and Rao', '22-minute meeting recorded by station CCTV; the third subject was later identified as A. Patil.', '2026-08-10T18:52:00Z', 'Andheri Station (East)', 'Surveillance_14.pdf', 0.88),
  ('00000000-0000-4000-b000-000000000004', '00000000-0000-4000-8000-00000000c001', ARRAY['00000000-0000-4000-8000-00000000e00b'::uuid, '00000000-0000-4000-8000-00000000e00c'::uuid]::uuid[], 'vehicle', 'MH01AB1234 recorded leaving the area', 'ANPR hit at 22:15, roughly four hours before the robbery was reported.', '2026-08-10T22:15:00Z', 'Andheri East', 'Vehicle_Records.xlsx', 0.91),
  ('00000000-0000-4000-b000-000000000005', '00000000-0000-4000-8000-00000000c001', ARRAY['00000000-0000-4000-8000-00000000e001'::uuid, '00000000-0000-4000-8000-00000000e002'::uuid]::uuid[], 'crime', 'Robbery reported, FIR 1023 registered', 'Registered against unknown persons; two subjects were identified later that week.', '2026-08-11T02:40:00Z', 'Andheri East', 'FIR_1023.pdf', 0.99),
  ('00000000-0000-4000-b000-000000000006', '00000000-0000-4000-8000-00000000c001', ARRAY['00000000-0000-4000-8000-00000000e001'::uuid, '00000000-0000-4000-8000-00000000e010'::uuid]::uuid[], 'meeting', 'Sharma visits a suspected fence', 'Seen entering Kulkarni''s electronics shop the morning after the incident; stock discrepancy later noted.', '2026-08-11T13:00:00Z', 'Kurla Electronics Market', 'Intel_Brief_09.docx', 0.58),
  ('00000000-0000-4000-b000-000000000007', '00000000-0000-4000-8000-00000000c002', ARRAY['00000000-0000-4000-8000-00000000e004'::uuid, '00000000-0000-4000-8000-00000000e00e'::uuid]::uuid[], 'transaction', 'INR 4,80,000 credited to A/C XXXX7741', 'Credit originating from a Thane branch, two days after the incident.', '2026-08-12T14:10:00Z', 'Thane', 'Transactions_Q2.xlsx', 0.9),
  ('00000000-0000-4000-b000-000000000008', '00000000-0000-4000-8000-00000000c002', ARRAY['00000000-0000-4000-8000-00000000e006'::uuid, '00000000-0000-4000-8000-00000000e00d'::uuid]::uuid[], 'location', 'Deepa Nair at Block C', 'Vehicle logged at the warehouse gate.', '2026-08-13T10:00:00Z', 'Bhiwandi Warehouse Block C', 'Surveillance_14.pdf', 0.7),
  ('00000000-0000-4000-b000-000000000009', '00000000-0000-4000-8000-00000000c002', ARRAY['00000000-0000-4000-8000-00000000e005'::uuid, '00000000-0000-4000-8000-00000000e00e'::uuid]::uuid[], 'transaction', 'Six transfers in 48 hours', 'Each transfer sized just below the reporting threshold — the pattern that triggered the referral.', '2026-08-13T11:02:00Z', 'Bhiwandi', 'Transactions_Q2.xlsx', 0.87),
  ('00000000-0000-4000-b000-00000000000a', '00000000-0000-4000-8000-00000000c002', ARRAY['00000000-0000-4000-8000-00000000e006'::uuid, '00000000-0000-4000-8000-00000000e00e'::uuid]::uuid[], 'transaction', 'Transfer authorised by the finance manager', 'Authorised using Nair''s credentials outside normal working hours.', '2026-08-13T16:44:00Z', 'Bhiwandi', 'Transactions_Q2.xlsx', 0.79),
  ('00000000-0000-4000-b000-00000000000b', '00000000-0000-4000-8000-00000000c002', ARRAY['00000000-0000-4000-8000-00000000e004'::uuid, '00000000-0000-4000-8000-00000000e005'::uuid]::uuid[], 'intelligence', 'Patil named as an intermediary', 'Intelligence brief describes Patil as the contact who introduces carriers to Sheikh.', '2026-08-15T16:30:00Z', null, 'Intel_Brief_07.docx', 0.86),
  ('00000000-0000-4000-b000-00000000000c', '00000000-0000-4000-8000-00000000c002', ARRAY['00000000-0000-4000-8000-00000000e017'::uuid, '00000000-0000-4000-8000-00000000e01a'::uuid, '00000000-0000-4000-8000-00000000e01b'::uuid]::uuid[], 'transaction', 'Two mule accounts opened within a week', 'Both accounts held by Salim Mirza, both consolidating into the primary Bhiwandi account within days of opening.', '2026-08-16T09:40:00Z', 'Bhiwandi', 'Transactions_Q2.xlsx', 0.8),
  ('00000000-0000-4000-b000-00000000000d', '00000000-0000-4000-8000-00000000c003', ARRAY['00000000-0000-4000-8000-00000000e020'::uuid, '00000000-0000-4000-8000-00000000e01e'::uuid, '00000000-0000-4000-8000-00000000e01f'::uuid]::uuid[], 'complaint', 'Complaint filed against QuickCash recovery agents', 'Complainant reports repeated threatening calls and an intimidation visit over a defaulted short-term loan.', '2026-08-20T10:30:00Z', 'Mumbai', 'Complaint_Rekha_Iyer.pdf', 0.95),
  ('00000000-0000-4000-b000-00000000000e', '00000000-0000-4000-8000-00000000c003', ARRAY['00000000-0000-4000-8000-00000000e01f'::uuid, '00000000-0000-4000-8000-00000000e020'::uuid, '00000000-0000-4000-8000-00000000e026'::uuid]::uuid[], 'intimidation', 'Recovery agent visits complainant''s residence', 'Bhatt arrives on a two-wheeler and waits outside the building for over an hour.', '2026-08-19T18:00:00Z', 'Mumbai', 'Surveillance_22.pdf', 0.81),
  ('00000000-0000-4000-b000-00000000000f', '00000000-0000-4000-8000-00000000c003', ARRAY['00000000-0000-4000-8000-00000000e020'::uuid, '00000000-0000-4000-8000-00000000e024'::uuid]::uuid[], 'transaction', 'Complainant pays under duress', 'Payment matches the amount and timing described in the complaint.', '2026-08-18T20:14:00Z', null, 'Transactions_QuickCash.xlsx', 0.88),
  ('00000000-0000-4000-b000-000000000010', '00000000-0000-4000-8000-00000000c004', ARRAY['00000000-0000-4000-8000-00000000e028'::uuid, '00000000-0000-4000-8000-00000000e02b'::uuid]::uuid[], 'crime', 'Maruti Swift MH12GH3456 reported stolen', 'Taken from a residential parking area overnight; no forced entry to the compound.', '2026-07-30T02:10:00Z', 'Vasai', 'FIR_1098.pdf', 0.9),
  ('00000000-0000-4000-b000-000000000011', '00000000-0000-4000-8000-00000000c004', ARRAY['00000000-0000-4000-8000-00000000e028'::uuid, '00000000-0000-4000-8000-00000000e02c'::uuid]::uuid[], 'crime', 'Hyundai Creta MH14IJ7890 reported stolen', 'Same method as the earlier theft, five days later.', '2026-08-05T01:40:00Z', 'Vasai', 'FIR_1098.pdf', 0.85),
  ('00000000-0000-4000-b000-000000000012', '00000000-0000-4000-8000-00000000c004', ARRAY['00000000-0000-4000-8000-00000000e02b'::uuid, '00000000-0000-4000-8000-00000000e02c'::uuid, '00000000-0000-4000-8000-00000000e02d'::uuid, '00000000-0000-4000-8000-00000000e02a'::uuid]::uuid[], 'raid', 'Both vehicles recovered in a single raid', 'Yard raid recovers both vehicles; one partially dismantled, the other with the engine number ground off.', '2026-08-07T06:00:00Z', 'Vasai Chop-Shop Yard', 'Raid_Report_Vasai.pdf', 0.97);

-- ------------------------------------------------------------------ alerts --
insert into public.alerts (id, case_id, entity_id, severity, type, title, description, rationale, status) values
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e004', 'critical', 'network_bridge', 'Arjun Patil bridges two otherwise separate groups', 'Every path between the CR-1023 group and the CR-1041 group runs through this entity. Removing it would split the network in two.', '{"metric":"betweenness_centrality","rank":1,"communities_bridged":2}'::jsonb, 'new'),
  ('00000000-0000-4000-c000-000000000002', '00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e00e', 'high', 'unusual_transaction', 'Structured credits into A/C XXXX7741', 'Six credits in 48 hours against a 90-day baseline of about four per month, each sized below the reporting threshold.', '{"metric":"transaction_frequency","baseline_per_month":4,"observed_48h":6}'::jsonb, 'reviewing'),
  ('00000000-0000-4000-c000-000000000003', '00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e009', 'high', 'communication_spike', 'Call volume spike before the incident', '17 calls to a single number in the six days before 10 August, against a weekly mean of 3.', '{"metric":"call_frequency","weekly_mean":3,"observed":17}'::jsonb, 'new'),
  ('00000000-0000-4000-c000-000000000004', '00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e00c', 'medium', 'shared_location', 'Three subjects co-located within 25 minutes', 'Sharma, Rao and Patil all placed at Andheri East on the evening of 10 August.', '{"metric":"location_cooccurrence","subjects":3,"window_minutes":25}'::jsonb, 'new'),
  ('00000000-0000-4000-c000-000000000005', '00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000e001', 'medium', 'entity_match', '"R. Sharma" may be the same person as Rahul Sharma', 'Name similarity plus a shared handset across FIR_1023.pdf and CDR_June_2026.csv. Needs an investigator''s confirmation before the records are merged.', '{"metric":"entity_resolution","similarity":0.92,"signals":["name","phone"]}'::jsonb, 'new'),
  ('00000000-0000-4000-c000-000000000006', '00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000e017', 'high', 'mule_account_pattern', 'Two accounts opened by the same holder within a week', 'Both accounts consolidate into the primary Bhiwandi account within days of opening — a classic layering pattern.', '{"metric":"account_velocity","accounts_opened":2,"window_days":7}'::jsonb, 'new'),
  ('00000000-0000-4000-c000-000000000007', '00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e021', 'critical', 'unlicensed_lender', 'QuickCash Fintech is not on the registered NBFC list', 'Corporate filing shows a digital lending business with no matching licence — a strong predicate for the extortion pattern reported.', '{"metric":"regulatory_match","licence_found":false}'::jsonb, 'new'),
  ('00000000-0000-4000-c000-000000000008', '00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000e01f', 'high', 'repeat_offender', 'Recovery agent has two prior recorded offences', 'Bhatt''s prior record includes a prior intimidation complaint against a different lender.', '{"metric":"prior_offences","count":2}'::jsonb, 'reviewing'),
  ('00000000-0000-4000-c000-000000000009', '00000000-0000-4000-8000-00000000c004', '00000000-0000-4000-8000-00000000e02a', 'high', 'chop_shop_pattern', 'Two stolen vehicles traced to the same yard within a week', 'Both thefts resolve to the same premises and the same named proprietor.', '{"metric":"location_cooccurrence","vehicles":2,"window_days":6}'::jsonb, 'confirmed');

commit;

-- Sanity check --------------------------------------------------------------
select
  (select count(*) from public.entities)      as entities,
  (select count(*) from public.relationships) as relationships,
  (select count(*) from public.cases)          as cases,
  (select count(*) from public.documents)      as documents,
  (select count(*) from public.events)         as events,
  (select count(*) from public.alerts)         as alerts;
