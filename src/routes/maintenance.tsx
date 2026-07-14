import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { shortDate, relDays } from "@/lib/format";
import type { MaintenanceStatus } from "@/data/types";

const COLS: MaintenanceStatus[] = ["Active Maintenance Customer", "Due Within 60 Days", "Due Within 30 Days", "Due Within 7 Days", "Maintenance Scheduled", "Maintenance Completed", "Maintenance Overdue", "Maintenance Paused"];

export const Route = createFileRoute("/maintenance")({ component: MaintenancePage });

function MaintenancePage() {
  const s = useCRM();
  const setStatus = useCRM((st) => st.setMaintStatus);
  const items = s.maintenance.map((m) => ({ ...m, status: m.status as string }));
  return (
    <>
      <PageHeader eyebrow="Maintenance" title="Annual Maintenance" description="Track every customer's yearly service cycle." />
      <Section>
        <KanbanBoard
          columns={COLS as unknown as string[]}
          items={items}
          onMove={(id, st) => setStatus(id, st as MaintenanceStatus)}
          renderCard={(m) => {
            const c = s.customers.find((c) => c.id === m.customerId)!;
            return (
              <Link to="/customers/$id" params={{ id: c.id }} className="block p-3 space-y-1">
                <div className="font-medium text-sm truncate">{c.firstName} {c.lastName}</div>
                <div className="text-xs text-muted-foreground">Due {shortDate(m.dueDate)}</div>
                <div className={`text-[11px] font-medium ${m.status === "Maintenance Overdue" ? "text-destructive" : "text-primary"}`}>{relDays(m.dueDate)}</div>
              </Link>
            );
          }}
        />
      </Section>
    </>
  );
}
