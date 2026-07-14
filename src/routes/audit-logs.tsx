import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { dateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/audit-logs")({ component: AuditLogsPage });

function AuditLogsPage() {
  const s = useCRM();
  return (
    <>
      <PageHeader eyebrow="Security" title="Audit Logs" description="Every change is recorded." />
      <Section>
        <Card><CardContent className="p-4 space-y-1">
          {s.audit.map((a) => {
            const u = s.users.find((u) => u.id === a.actorId);
            return (
              <div key={a.id} className="text-xs flex items-center gap-2 border-b last:border-0 py-2">
                <Badge variant="outline">{a.action}</Badge>
                <span className="font-medium">{u?.name}</span>
                <span className="text-muted-foreground">{a.entity} {a.entityId}</span>
                {a.detail && <span className="text-muted-foreground truncate flex-1">· {a.detail}</span>}
                <span className="text-muted-foreground ml-auto shrink-0">{dateTime(a.at)}</span>
              </div>
            );
          })}
        </CardContent></Card>
      </Section>
    </>
  );
}
