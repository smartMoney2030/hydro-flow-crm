import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/installations")({ component: InstallsPage });

function InstallsPage() {
  const s = useCRM();
  return (
    <>
      <PageHeader eyebrow="Field" title="Installations" description={`${s.installations.length} installs`} />
      <Section>
        <div className="grid gap-2">
          {s.installations.map((i) => {
            const c = s.customers.find((c) => c.id === i.customerId)!;
            const t = s.users.find((u) => u.id === i.technicianId);
            return (
              <Card key={i.id} className="shadow-sm hover:shadow-card">
                <CardContent className="p-4">
                  <Link to="/customers/$id" params={{ id: c.id }} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-muted-foreground truncate">{i.address}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">Tech: {t?.name} · {i.equipment.join(", ")}</div>
                    </div>
                    <div className="text-xs">{dateTime(i.startAt)}</div>
                    <StatusBadge status={i.status === "In Progress" ? "Installation in Progress" : i.status === "Completed" ? "Installation Completed" : "Installation Scheduled"} />
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
