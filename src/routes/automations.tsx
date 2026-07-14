import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/automations")({ component: AutomationsPage });

function AutomationsPage() {
  const s = useCRM();
  return (
    <>
      <PageHeader eyebrow="Workflows" title="Automation Center" description="Rules that run automatically as records change." />
      <Section className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2">
          {s.automationRules.map((r) => (
            <Card key={r.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground mt-1"><b>When:</b> {r.trigger}</div>
                    <div className="text-xs text-muted-foreground"><b>Then:</b> {r.effect}</div>
                    <div className="mt-2 flex gap-2 items-center">
                      <Badge variant="secondary">{r.runsToday} runs today</Badge>
                      {r.lastRunAt && <span className="text-[11px] text-muted-foreground">Last: {dateTime(r.lastRunAt)}</span>}
                    </div>
                  </div>
                  <Switch checked={r.enabled} onCheckedChange={() => s.toggleAutomation(r.id)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent runs</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-2">
            {s.automationRuns.map((run) => {
              const rule = s.automationRules.find((r) => r.id === run.ruleId);
              return (
                <div key={run.id} className="text-xs flex items-center gap-2 border-b last:border-0 py-2">
                  <Badge variant={run.status === "success" ? "secondary" : "destructive"}>{run.status}</Badge>
                  <span className="font-medium">{rule?.name}</span>
                  <span className="text-muted-foreground truncate flex-1">{run.detail}</span>
                  <span className="text-muted-foreground">{dateTime(run.at)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
