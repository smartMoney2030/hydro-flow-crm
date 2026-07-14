import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { dateTime, relDays } from "@/lib/format";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

function TasksPage() {
  const s = useCRM();
  const open = s.tasks.filter((t) => !t.done);
  const done = s.tasks.filter((t) => t.done);
  return (
    <>
      <PageHeader eyebrow="Work" title="Tasks" description={`${open.length} open, ${done.length} done`} />
      <Section className="space-y-4">
        {([["Open", open], ["Completed", done]] as const).map(([label, list]) => (
          <div key={label}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{label}</h2>
            <div className="grid gap-2">
              {(list as typeof open).map((t) => {
                const u = s.users.find((u) => u.id === t.assigneeId);
                return (
                  <Card key={t.id} className="shadow-sm">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Checkbox checked={t.done} onCheckedChange={() => s.toggleTask(t.id)} />
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                        {t.description && <div className="text-xs text-muted-foreground truncate">{t.description}</div>}
                        <div className="text-[11px] text-muted-foreground mt-0.5">{dateTime(t.dueAt)} · {u?.name}</div>
                      </div>
                      <Badge variant={t.priority === "high" ? "destructive" : t.priority === "med" ? "secondary" : "outline"}>{t.priority}</Badge>
                      <span className="text-[11px] text-muted-foreground shrink-0">{relDays(t.dueAt)}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </Section>
    </>
  );
}
