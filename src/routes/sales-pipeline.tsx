import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useCRM } from "@/store/crm";
import { money, relDays } from "@/lib/format";
import type { LeadStatus } from "@/data/types";

const COLS: LeadStatus[] = ["New Lead", "Contact Attempted", "Sales Call Scheduled", "Qualified", "Quote Sent", "Follow-Up", "Sale Won", "Sale Lost"];

export const Route = createFileRoute("/sales-pipeline")({ component: SalesPipeline });

function SalesPipeline() {
  const leads = useCRM((s) => s.leads);
  const customers = useCRM((s) => s.customers);
  const users = useCRM((s) => s.users);
  const setLeadStatus = useCRM((s) => s.setLeadStatus);

  const items = leads.map((l) => ({ ...l, status: l.status as string }));

  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Sales Pipeline"
        description="Drag cards across stages. Moving to Sale Won triggers job creation."
      />
      <Section>
        <KanbanBoard
          columns={COLS as unknown as string[]}
          items={items}
          onMove={(id, s) => setLeadStatus(id, s as LeadStatus)}
          renderCard={(l) => {
            const c = customers.find((c) => c.id === l.customerId)!;
            const u = users.find((u) => u.id === l.assignedTo)!;
            return (
              <Link to="/customers/$id" params={{ id: c.id }} className="block p-3 space-y-1.5">
                <div className="font-medium text-sm truncate">{c.firstName} {c.lastName}</div>
                <div className="text-xs text-muted-foreground truncate">{c.propertyAddress}</div>
                <div className="flex items-center gap-2 pt-1">
                  {l.quoteAmount && <span className="text-xs font-semibold text-primary">{money(l.quoteAmount)}</span>}
                  {l.salesCallAt && <span className="text-[10px] text-muted-foreground">📞 {relDays(l.salesCallAt)}</span>}
                </div>
                <div className="text-[10px] text-muted-foreground">{u.name}</div>
              </Link>
            );
          }}
        />
      </Section>
    </>
  );
}
