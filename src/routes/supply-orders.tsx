import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/supply-orders")({ component: SupplyOrdersPage });

function SupplyOrdersPage() {
  const s = useCRM();
  return (
    <>
      <PageHeader eyebrow="Fulfillment" title="Supply Orders" description={`${s.supplyOrders.length} orders`} />
      <Section>
        <div className="grid gap-2">
          {s.supplyOrders.map((o) => {
            const j = s.jobs.find((j) => j.id === o.jobId)!;
            const c = s.customers.find((c) => c.id === j.customerId)!;
            return (
              <Card key={o.id} className="shadow-sm hover:shadow-card">
                <CardContent className="p-4">
                  <Link to="/customers/$id" params={{ id: c.id }} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.firstName} {c.lastName} · {j.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground truncate">{o.vendor} · {o.lineItems.length} items · tracking {o.tracking}</div>
                    </div>
                    <div className="text-xs">Ordered {shortDate(o.orderDate)}</div>
                    <div className="text-xs">ETA {shortDate(o.expectedDelivery)}</div>
                    <StatusBadge status={o.status === "In Transit" ? "Awaiting Delivery" : o.status === "Ordered" ? "Supplies Ordered" : "Installation Completed"} />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}
