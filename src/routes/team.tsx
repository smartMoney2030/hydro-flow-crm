import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/team")({ component: TeamPage });

function TeamPage() {
  const s = useCRM();
  return (
    <>
      <PageHeader eyebrow="People" title="Team" description={`${s.users.length} members`} />
      <Section>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {s.users.map((u) => (
            <Card key={u.id} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full grid place-items-center text-sm font-semibold text-white shrink-0" style={{ backgroundColor: u.avatarColor }}>{initials(u.name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  <div className="text-xs text-muted-foreground">{u.phone}</div>
                </div>
                <Badge variant="secondary" className="capitalize shrink-0">{u.role}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
