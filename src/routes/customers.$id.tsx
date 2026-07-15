import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { HistoricalBadge } from "@/components/import/HistoricalBadge";
import { useCRM } from "@/store/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { money, shortDate, initials, dateTime, relDays } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/customers/$id")({
  component: Customer360,
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <div className="text-lg font-semibold">Customer not found</div>
      <Link to="/customers" className="text-primary text-sm">Back to customers</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  loader: ({ params }) => {
    return { id: params.id };
  },
});

function Customer360() {
  const { id } = Route.useLoaderData();
  const s = useCRM();
  const c = s.customers.find((c) => c.id === id);
  if (!c) throw notFound();

  const leads = s.leads.filter((l) => l.customerId === id);
  const jobs = s.jobs.filter((j) => j.customerId === id);
  const installs = s.installations.filter((i) => i.customerId === id);
  const eqs = s.equipment.filter((e) => e.customerId === id);
  const maints = s.maintenance.filter((m) => m.customerId === id);
  const tasks = s.tasks.filter((t) => t.relatedCustomerId === id);
  const audit = s.audit.filter((a) => a.entityId === id || jobs.some((j) => j.id === a.entityId) || leads.some((l) => l.id === a.entityId));

  const timeline = [
    ...leads.map((l) => ({ at: l.createdAt, title: `Lead ${l.status}`, kind: "lead" })),
    ...jobs.map((j) => ({ at: j.saleDate, title: `Job ${j.invoiceNumber} · ${j.status}`, kind: "job" })),
    ...installs.map((i) => ({ at: i.startAt, title: `Installation ${i.status}`, kind: "install" })),
    ...maints.filter((m) => m.completedAt).map((m) => ({ at: m.completedAt!, title: "Maintenance completed", kind: "maint" })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <>
      <PageHeader
        eyebrow="Customer"
        title={`${c.firstName} ${c.lastName}`}
        description={c.propertyAddress}
        actions={
          <>
            <Button variant="outline" size="sm"><Phone className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button>
            <Button size="sm" className="bg-primary">Add note</Button>
          </>
        }
      />
      <Section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="shadow-card h-fit">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full grid place-items-center text-sm font-semibold text-white bg-gradient-water shrink-0">
                  {initials(`${c.firstName} ${c.lastName}`)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.firstName} {c.lastName}</div>
                  <div className="text-xs text-muted-foreground">Since {shortDate(c.createdAt)}</div>
                </div>
              </div>
              <dl className="text-sm space-y-2 pt-2">
                <div className="flex items-start gap-2"><Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><span>{c.phone}</span></div>
                <div className="flex items-start gap-2"><Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><span className="truncate">{c.email}</span></div>
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><span className="text-xs">{c.propertyAddress}</span></div>
                <div className="flex items-start gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><span className="text-xs capitalize">Prefers {c.preferredContact}</span></div>
              </dl>
              <div className="pt-2 text-xs text-muted-foreground">Source: {c.leadSource}</div>
              {c.notes && <div className="text-xs bg-warning/10 border border-warning/20 rounded p-2">{c.notes}</div>}
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
              <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
              <TabsTrigger value="installs">Installs ({installs.length})</TabsTrigger>
              <TabsTrigger value="equipment">Equipment ({eqs.length})</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance ({maints.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card><CardContent className="p-4 space-y-3">
                {timeline.length === 0 && <div className="text-sm text-muted-foreground">No activity yet.</div>}
                {timeline.map((e, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{dateTime(e.at)}</div>
                    </div>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="leads">
              <Card><CardContent className="p-4 space-y-2">
                {leads.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 justify-between border-b last:border-0 py-2">
                    <div className="text-sm">{l.waterConcerns.join(", ")}</div>
                    <div className="flex items-center gap-2">
                      {l.quoteAmount && <span className="text-sm font-semibold">{money(l.quoteAmount)}</span>}
                      <StatusBadge status={l.status} />
                    </div>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card><CardContent className="p-4 space-y-2">
                {jobs.map((j) => (
                  <div key={j.id} className="border-b last:border-0 py-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <div>
                      <div className="font-medium text-sm">{j.invoiceNumber} · {j.systemType}</div>
                      <div className="text-xs text-muted-foreground">{shortDate(j.saleDate)} · {j.paymentStatus} · balance {money(j.totalPrice - j.depositCollected)}</div>
                    </div>
                    <StatusBadge status={j.status} />
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="installs">
              <Card><CardContent className="p-4 space-y-2">
                {installs.map((i) => (
                  <div key={i.id} className="border-b last:border-0 py-3">
                    <div className="font-medium text-sm">{dateTime(i.startAt)} · {i.equipment.join(", ")}</div>
                    <div className="text-xs text-muted-foreground">Tech: {s.users.find((u) => u.id === i.technicianId)?.name}</div>
                    {i.technicianNotes && <div className="text-xs mt-1">{i.technicianNotes}</div>}
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="equipment">
              <Card><CardContent className="p-4 space-y-2">
                {eqs.map((e) => (
                  <div key={e.id} className="border-b last:border-0 py-3">
                    <div className="font-medium text-sm">{e.type} · {e.model}</div>
                    <div className="text-xs text-muted-foreground">SN {e.serial} · installed {shortDate(e.installDate)} · warranty {shortDate(e.warrantyExpires)}</div>
                    <div className="text-xs text-muted-foreground">Next maintenance {shortDate(e.nextMaintenance)}</div>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="maintenance">
              <Card><CardContent className="p-4 space-y-2">
                {maints.map((m) => (
                  <div key={m.id} className="border-b last:border-0 py-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <div>
                      <div className="font-medium text-sm">Due {shortDate(m.dueDate)} ({relDays(m.dueDate)})</div>
                      {m.workPerformed && <div className="text-xs text-muted-foreground">{m.workPerformed}</div>}
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card><CardContent className="p-4 space-y-2">
                {tasks.length === 0 && <div className="text-sm text-muted-foreground">No tasks for this customer.</div>}
                {tasks.map((t) => (<div key={t.id} className="text-sm">{t.title}</div>))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card><CardContent className="p-4 space-y-2">
                {audit.slice(0, 20).map((a) => (
                  <div key={a.id} className="text-xs text-muted-foreground">
                    {dateTime(a.at)} — {s.users.find((u) => u.id === a.actorId)?.name} {a.action} {a.entity} {a.detail && `· ${a.detail}`}
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="aspect-[3/1] bg-gradient-soft rounded-lg grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, #0891b2 0%, transparent 50%), radial-gradient(circle at 70% 60%, #22d3ee 0%, transparent 50%)" }} />
              <div className="relative text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto" />
                <div className="text-xs text-muted-foreground mt-1">{c.lat.toFixed(3)}, {c.lng.toFixed(3)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
