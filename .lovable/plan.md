## My Water People CRM — Build Plan

A full-featured demo CRM for a water-treatment business, built as a frontend-only app with rich seeded data (no backend/auth server required for the demo). All roles, "automations," and data live client-side in a seeded in-memory store exposed via React Query, so every screen is immediately interactive in preview.

### Scope & assumptions
- **Frontend-only demo.** No Lovable Cloud yet — auth is a mock role switcher (Admin / Salesperson / Scheduler / Technician) with a login screen UI. Security notices explain what production would require. Say the word and I'll wire real auth + Postgres in a follow-up.
- **Map:** demo SVG visualization of San Antonio with realistic markers, filters, clustering, route panel. Architected so a Mapbox/Google key can drop in later.
- **Calendar:** custom month/week/day/technician views with drag-to-reschedule.
- **Seed data:** ~30 customers, ~40 leads across every pipeline stage, ~25 jobs, supply orders, installations, equipment, maintenance visits spanning overdue → 60-day-out, tasks, notifications, audit logs, technicians.
- **Design:** water-themed — deep ocean navy + aqua/cyan gradients, soft wave motifs, Inter/DM Sans. Tailwind v4 tokens in `src/styles.css`, shadcn components, fully responsive.

### Architecture
```text
src/
  routes/               file-based routes for every module below
    __root.tsx          shell + sidebar/topbar + role switcher
    auth.tsx            login + forgot-password UI (demo)
    index.tsx           dashboard
    leads.tsx, sales-pipeline.tsx, jobs-pipeline.tsx
    customers.tsx, customers.$id.tsx (Customer 360)
    supply-orders.tsx, calendar.tsx, map.tsx
    installations.tsx, equipment.tsx, maintenance.tsx
    tasks.tsx, automations.tsx, reports.tsx
    team.tsx, audit-logs.tsx, settings.tsx
    technician/index.tsx, technician/job.$id.tsx  (mobile tech UX)
  data/                 seed.ts + typed models (Customer, Lead, Job, ...)
  store/                Zustand store + React Query hooks (mock persistence)
  components/
    layout/ (AppShell, Sidebar, MobileNav, RoleSwitcher)
    kanban/ (Board, Column, Card w/ drag-drop via dnd-kit)
    calendar/ (Month, Week, Day, TechView, EventDrawer)
    map/ (DemoMap SVG, MarkerLayer, RoutePanel, Filters)
    customer/ (Overview, Timeline, Tabs...)
    technician/ (SignaturePad, PhotoUploader, JobActions)
    common/ (StatCard, EmptyState, ConfirmDialog, PageHeader)
  lib/ (automations.ts — visible rule engine, formatters, permissions.ts)
```

### Modules & pages
1. **Auth**: `/auth` login + forgot-password UI, mock session; role switcher pill in header (Admin/Sales/Scheduler/Tech).
2. **Dashboard**: 15+ clickable stat cards + charts (recharts) — new leads, sales calls due, quotes out, sales won MTD, unpaid deposits, outstanding balances, orders in transit, jobs ready to schedule, installs this week, maintenance ≤30d, overdue maintenance, revenue MTD, conversion %, lead sources donut, tech workload bar.
3. **Leads / Sales Pipeline / Jobs Pipeline / Maintenance Pipeline**: dnd-kit kanban with search, filters, counts, card detail sheet, status transitions that trigger automations.
4. **Customers list + Customer 360** (`/customers/$id`): tabs for Overview, Contact, Addresses+mini-map, Timeline, Leads, Quotes/Sales, Payments, Jobs, Installations, Equipment, Maintenance, Files, Notes, Tasks, Audit.
5. **Supply Orders / Installations / Equipment / Maintenance / Tasks**: filterable tables with detail drawers.
6. **Calendar**: month/week/day/tech views, drag-reschedule, conflict warnings, travel-buffer setting, quick-view drawer, Google Calendar sync toggle placeholder.
7. **Map**: demo San Antonio SVG with pins colored by status, clustering at zoom-out, filters, unscheduled/maintenance-due layers, multi-select → route panel with ETAs, customer drawer. Adapter interface so `<MapProvider>` can be swapped to Mapbox.
8. **Technician mobile view** (`/technician`): today's appointments list, big touch targets, Start Job → notes/photos/serial/signature/complete/follow-up flow, signature pad (canvas), photo upload placeholders.
9. **Automation Center**: list of the 8 rules, enable/disable toggles, recent-runs log, "trigger manually" for demo.
10. **Reports**: pipeline conversion, revenue trend, tech utilization, maintenance compliance.
11. **Team / Audit Logs / Settings / Backup Status**: staff table with roles, filterable audit trail, session/security settings with production hardening callouts.

### Automations (mock rule engine, visible in `/automations`)
Website lead → customer+lead+task; Sale Won → job+payment task; Deposit paid → Supplies Need Ordering; Supplies delivered → Ready to Schedule; Install scheduled → calendar event+reminders; Install completed → equipment+warranty+first maintenance +1yr; Maintenance 60/30/7 day reminders + overdue flag; Maintenance completed → next visit +1yr. Each rule logs a run entry for the Automation Center.

### Design system
- Tokens in `src/styles.css`: `--primary` deep ocean navy, `--accent` aqua, gradient `--gradient-water`, `--shadow-wave`, status colors (lead/quote/won/lost/scheduled/overdue). Custom shadcn variants (`Button variant="water"`, status Badges).
- Subtle SVG wave dividers, droplet iconography (lucide `Droplet`, `Waves`).
- Fully responsive: sidebar collapses to icon rail on tablet, bottom nav on mobile, dedicated technician mobile layout.
- Loading skeletons, empty states, confirm dialogs on all destructive actions.

### Delivery
Given the size, I'll build in one pass across many parallel file writes. Expect ~60-80 files. The result will be a navigable, seeded demo — every pipeline, calendar state, map filter, alert, timeline, and tech flow populated. Nothing gets published.

Approve and I'll build it.
