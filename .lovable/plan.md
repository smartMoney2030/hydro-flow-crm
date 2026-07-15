# Existing Customer Import

Adds a new module for onboarding pre-existing customers (single or bulk) without forcing them through the lead pipeline.

## Navigation & routes
- Add nav item **Import Customers** (admin, scheduler, salesperson) → `/import-customers`.
- New routes:
  - `/import-customers` — landing page with two cards: "Add one existing customer" and "Import from CSV/Spreadsheet". Includes a Recent Imports table with per-batch "Undo" (admin only).
  - `/import-customers/manual` — single-record form (all fields listed in the request), starting-stage selector, duplicate warning, historical-data notice.
  - `/import-customers/csv` — 4-step wizard: Upload → Map columns → Preview & dedupe → Import report.

## Data model additions (src/data/types.ts)
- Extend `Customer` with optional `isHistorical?: boolean` and `importBatchId?: string`.
- New `CustomerStage = "Existing Customer" | "Installation Pending" | "Installation Completed" | "Active Maintenance Customer" | "Maintenance Due" | "Maintenance Overdue" | "Inactive Customer"` stored on customer as `stage?: CustomerStage`.
- New `ImportBatch { id, createdAt, actorId, source: "manual"|"csv", filename?, counts: {created, updated, skipped, failed}, customerIds: string[], reversedAt?: string }`.

## Store additions (src/store/crm.ts)
- `importBatches: ImportBatch[]`.
- `addExistingCustomer(input, options)` — creates Customer + optional Equipment record(s) + optional MaintenanceVisit + optional Installation calendar event; computes `nextMaintenance = installDate + 1 year` when possible; skips lead creation unless `createLead: true`; writes audit log; returns the created customer.
- `findDuplicateCustomers(candidate)` — matches by normalized name, phone (digits only), email (lowercased), or property address; returns list with match reasons + score.
- `commitImportBatch(rows, mapping, resolutions)` — iterates rows, applies skip/update/create per row, records ImportBatch, audit entries.
- `reverseImportBatch(id)` — admin only; deletes customers + linked equipment/maintenance/events created by that batch; marks `reversedAt`.

## Manual entry (`/import-customers/manual`)
Sections in one scrollable form:
1. Customer info (name, phone, email, billing address, property address, preferred contact, notes).
2. Historical sale (original sale date, original install date, salesperson, technician, purchase price, payment status).
3. Equipment (repeatable rows: type, model, serial, warranty expiration).
4. Maintenance (enrolled toggle, last maintenance, next maintenance due — auto-suggested from install date + 1yr; editable).
5. Previous service history (freeform textarea + repeatable visit entries).
6. Photos & documents (file input, stored as data URLs in state for demo).
7. **Starting stage** radio group with the 7 stages.
8. "Also create a sales lead for this customer" checkbox (default off).

Behavior:
- Live duplicate detection panel appears once name/email/phone/address entered; offers "Update existing" (prefills form editing that customer) or "Continue as new".
- On submit: geocode via approximate San Antonio jitter (existing seed pattern — no external API), add pin to map, create equipment/maintenance/calendar entries, tag customer `isHistorical: true`, toast success, link to profile.

## CSV wizard (`/import-customers/csv`)
- **Step 1 Upload**: drop zone + "Download CSV template" button (generated client-side with all supported headers and one example row).
- **Step 2 Map columns**: table of CSV headers → CRM field dropdowns, with auto-guessed mapping by header name. Required fields (name, property address) flagged.
- **Step 3 Preview**: table of parsed rows with per-row status pills (Valid / Missing X / Duplicate of Y). Duplicate rows expose a per-row action (Skip / Update existing / Create new). Bulk actions in header.
- **Step 4 Report**: totals for Created / Updated / Skipped / Failed with expandable row details; "Undo this import" button (admin) that calls `reverseImportBatch`.

Uses Papa Parse (`bun add papaparse @types/papaparse`) for CSV parsing.

## UI/UX details
- Reuse `PageHeader`, `Section`, shadcn `Card`, `Input`, `Select`, `Table`, `Tabs`, `Badge`, `Dialog`, `Alert`.
- Yellow "Historical data" badge component shown on customer cards/profile when `isHistorical`.
- Non-admin viewers see the Undo button disabled with tooltip.

## Files to add
- `src/routes/import-customers.tsx`
- `src/routes/import-customers.manual.tsx`
- `src/routes/import-customers.csv.tsx`
- `src/components/import/DuplicateWarning.tsx`
- `src/components/import/ColumnMapper.tsx`
- `src/components/import/HistoricalBadge.tsx`
- `src/lib/import.ts` (CSV template, header guessing, duplicate matching helpers)

## Files to modify
- `src/data/types.ts` — new fields + ImportBatch.
- `src/store/crm.ts` — new actions + state.
- `src/lib/nav.ts` — nav entry.
- `src/routes/customers.tsx` and `src/routes/customers.$id.tsx` — show historical badge.

## Out of scope
- Real geocoding (uses seeded lat/lng jitter within San Antonio bbox, matching existing map behavior).
- Real file storage for photos/docs (data URLs kept in memory for demo).
- Server persistence — everything remains in the existing Zustand demo store, consistent with the rest of the app.
