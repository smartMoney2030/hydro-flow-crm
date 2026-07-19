# My Water People CRM

A mobile-friendly, full-stack CRM for a water-treatment sales, installation, and annual maintenance business. Built as a polished demo with realistic seeded data across every module — sales, jobs, maintenance, customers, calendar, map, and a technician mobile view.

Live preview: https://hydro-flow-crm.lovable.app

## Features

- **Dashboard** — KPI cards, tech workload, and lead source charts
- **Pipelines** — drag-and-drop kanban for Sales, Jobs, and Maintenance
- **Customer 360** — profile with timeline, leads, jobs, installs, equipment
- **Existing Customer Import** — manual entry + CSV wizard (upload → map columns → preview & dedupe → report) with progress bar, row-level errors, and admin-only undo
- **Google Maps** — customer pins around San Antonio, color-coded by maintenance status
- **Calendar** — month / week / day / technician views
- **Technician mobile view** — appointments list, job flow, canvas signature pad
- **Team management** — admin CRUD with role-based access (Admin / Salesperson / Scheduler / Technician)
- **Automations** — visible rule engine with mock triggers
- **Audit log, tasks, supply orders, installations, equipment, reports, settings**

## Tech stack

- [TanStack Start](https://tanstack.com/start) (v1) + React 19
- Vite 7, TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui + Radix
- Zustand (client state), TanStack Query
- Recharts, dnd-kit, Papa Parse, Google Maps JS API
- Deploys to Cloudflare Workers

## Getting started

```bash
bun install
bun run dev        # http://localhost:8080
bun run build      # production build
bun run lint
```

## Project structure

```
src/
  routes/          # file-based routes (TanStack Router)
  components/      # UI + feature components (shadcn in ui/)
  store/crm.ts     # Zustand store — customers, jobs, imports, etc.
  data/            # types + seed data
  lib/             # helpers (import, format, nav)
```

Routes are file-based — see `src/routes/README.md` for conventions. Do not edit `src/routeTree.gen.ts` (auto-generated).

## Development notes

- Built and maintained via [Lovable](https://lovable.dev). Two-way GitHub sync is enabled — commits from either side stay in sync.
- Roles are a UI-level demo switcher (top bar). Production hardening (RLS, server-side auth, encryption) is called out in the Settings page.
- All data lives in the Zustand store; there is no backend persistence in this demo.

## License

Private / proprietary.
