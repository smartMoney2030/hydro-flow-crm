import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useCRM } from "@/store/crm";
import { money, shortDate } from "@/lib/format";
import type { JobStatus } from "@/data/types";

const COLS: JobStatus[] = ["Payment Pending", "Deposit Collected", "Supplies Need Ordering", "Supplies Ordered", "Awaiting Delivery", "Ready to Schedule", "Installation Scheduled", "Installation in Progress", "Installation Completed", "Follow-Up Required", "Job Closed"];

export const Route = createFileRoute("/jobs-pipeline")({ component: JobsPipeline });

function JobsPipeline() {
  const jobs = useCRM((s) => s.jobs);
  const customers = useCRM((s) => s.customers);
  const setJobStatus = useCRM((s) => s.setJobStatus);
  const items = jobs.map((j) => ({ ...j, status: j.status as string }));

  return (
    <>
      <PageHeader eyebrow="Fulfillment" title="Jobs Pipeline" description="Deposit → supplies → schedule → install → close." />
      <Section>
        <KanbanBoard
          columns={COLS as unknown as string[]}
          items={items}
          onMove={(id, s) => setJobStatus(id, s as JobStatus)}
          renderCard={(j) => {
            const c = customers.find((c) => c.id === j.customerId)!;
            return (
              <Link to="/customers/$id" params={{ id: c.id }} className="block p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm truncate">{c.firstName} {c.lastName}</div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{j.invoiceNumber}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{j.systemType}</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-primary">{money(j.totalPrice)}</span>
                  <span className="text-[10px] text-muted-foreground">{shortDate(j.saleDate)}</span>
                </div>
              </Link>
            );
          }}
        />
      </Section>
    </>
  );
}
