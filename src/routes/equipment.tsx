import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { shortDate, relDays } from "@/lib/format";

export const Route = createFileRoute("/equipment")({ component: EquipmentPage });

function EquipmentPage() {
  const s = useCRM();
  return (
    <>
      <PageHeader eyebrow="Assets" title="Equipment" description={`${s.equipment.length} units in service`} />
      <Section>
        <div className="grid gap-2 md:grid-cols-2">
          {s.equipment.map((e) => {
            const c = s.customers.find((c) => c.id === e.customerId)!;
            return (
              <Card key={e.id} className="shadow-sm hover:shadow-card">
                <CardContent className="p-4">
                  <Link to="/customers/$id" params={{ id: c.id }} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{e.type} · {e.model}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.firstName} {c.lastName}</div>
                        <div className="text-[11px] text-muted-foreground">SN {e.serial}</div>
                      </div>
                      <Badge variant="secondary">{e.status}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1">
                      <div>Installed: {shortDate(e.installDate)}</div>
                      <div>Warranty: {shortDate(e.warrantyExpires)}</div>
                      <div className="col-span-2">Next maintenance: {shortDate(e.nextMaintenance)} ({relDays(e.nextMaintenance)})</div>
                    </div>
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
