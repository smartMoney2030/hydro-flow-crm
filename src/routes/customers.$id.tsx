import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { HistoricalBadge } from "@/components/import/HistoricalBadge";
import { useCRM } from "@/store/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { money, shortDate, initials, dateTime, relDays } from "@/lib/format";
import { parseServiceHistory } from "@/lib/service-history";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditCustomerDialog } from "@/components/customers/EditCustomerDialog";
import { EquipmentDialog } from "@/components/customers/EquipmentDialog";
import {
  RelatedRecordDialog,
  type RelatedRecordType,
} from "@/components/customers/RelatedRecordDialog";
import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/customers/$id")({
  component: Customer360,
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <div className="text-lg font-semibold">Customer not found</div>
      <Link to="/customers" className="text-primary text-sm">
        Back to customers
      </Link>
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
  const [customerEditorOpen, setCustomerEditorOpen] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [recordEditor, setRecordEditor] = useState<{
    type: RelatedRecordType;
    recordId?: string;
  } | null>(null);
  const [equipmentEditor, setEquipmentEditor] = useState<{ equipmentId?: string } | null>(null);
  const c = s.customers.find((c) => c.id === id);
  if (!c) throw notFound();

  const leads = s.leads.filter((l) => l.customerId === id);
  const jobs = s.jobs.filter((j) => j.customerId === id);
  const installs = s.installations.filter((i) => i.customerId === id);
  const eqs = s.equipment.filter((e) => e.customerId === id);
  const maints = s.maintenance.filter((m) => m.customerId === id);
  const tasks = s.tasks.filter((t) => t.relatedCustomerId === id);
  const audit = s.audit.filter(
    (a) =>
      a.entityId === id ||
      jobs.some((j) => j.id === a.entityId) ||
      leads.some((l) => l.id === a.entityId) ||
      installs.some((i) => i.id === a.entityId) ||
      eqs.some((e) => e.id === a.entityId) ||
      maints.some((m) => m.id === a.entityId) ||
      tasks.some((t) => t.id === a.entityId),
  );
  const serviceHistory = parseServiceHistory(c.previousServiceHistory);

  const timeline = [
    ...leads.map((l) => ({ at: l.createdAt, title: `Lead ${l.status}`, kind: "lead" })),
    ...jobs.map((j) => ({
      at: j.saleDate,
      title: `Job ${j.invoiceNumber} · ${j.status}`,
      kind: "job",
    })),
    ...installs.map((i) => ({ at: i.startAt, title: `Installation ${i.status}`, kind: "install" })),
    ...maints
      .filter((m) => m.completedAt)
      .map((m) => ({ at: m.completedAt!, title: "Maintenance completed", kind: "maint" })),
    ...serviceHistory.map((entry) => ({
      at: entry.at,
      dateLabel: entry.dateLabel,
      title: `Previous service: ${entry.detail}`,
      kind: "history",
    })),
  ].sort(
    (a, b) =>
      (b.at ? new Date(b.at).getTime() : -Infinity) - (a.at ? new Date(a.at).getTime() : -Infinity),
  );
  const visibleTimeline = timelineExpanded ? timeline : timeline.slice(0, 5);
  const canExpandTimeline = timeline.length > 5;
  const mapQuery = c.propertyAddress || `${c.lat},${c.lng}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.propertyAddress || mapQuery)}`;

  return (
    <>
      <PageHeader
        eyebrow="Customer"
        title={`${c.firstName} ${c.lastName}`}
        description={c.propertyAddress}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCustomerEditorOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit customer
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Add record
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setRecordEditor({ type: "job" })}>
                  Add job
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRecordEditor({ type: "installation" })}>
                  Add installation
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRecordEditor({ type: "maintenance" })}>
                  Add maintenance
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setEquipmentEditor({})}>
                  Add equipment
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRecordEditor({ type: "task" })}>
                  Add task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
      <Section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch">
          <Card className="shadow-card h-fit lg:h-[430px]">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full grid place-items-center text-sm font-semibold text-white bg-gradient-water shrink-0">
                  {initials(`${c.firstName} ${c.lastName}`)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate flex items-center gap-1.5">
                    {c.firstName} {c.lastName}
                    {c.isHistorical && <HistoricalBadge />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.stage ? `${c.stage} · ` : ""}Since {shortDate(c.createdAt)}
                  </div>
                </div>
              </div>
              <dl className="text-sm space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-xs">{c.propertyAddress}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-xs capitalize">Prefers {c.preferredContact}</span>
                </div>
              </dl>
              <div className="pt-2 text-xs text-muted-foreground">Source: {c.leadSource}</div>
              {c.notes && (
                <div className="text-xs bg-warning/10 border border-warning/20 rounded p-2">
                  {c.notes}
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs
            defaultValue="timeline"
            className={timelineExpanded ? undefined : "flex min-h-0 flex-col lg:h-[430px]"}
          >
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

            <TabsContent
              value="timeline"
              className={timelineExpanded ? undefined : "mt-4 min-h-0 flex-1"}
            >
              <Card className={timelineExpanded ? undefined : "h-full"}>
                <CardContent
                  className={timelineExpanded ? "space-y-3 p-4" : "flex h-full flex-col p-4"}
                >
                  <div
                    className={
                      timelineExpanded ? "space-y-3" : "min-h-0 flex-1 space-y-3 overflow-hidden"
                    }
                  >
                    {timeline.length === 0 && (
                      <div className="text-sm text-muted-foreground">No activity yet.</div>
                    )}
                    {visibleTimeline.map((e, i) => (
                      <div key={`${e.kind}-${e.at || "undated"}-${i}`} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-sm font-medium">{e.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {e.dateLabel || (e.at ? dateTime(e.at) : "Date not provided")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {canExpandTimeline && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto shrink-0 self-end"
                      onClick={() => setTimelineExpanded((expanded) => !expanded)}
                    >
                      {timelineExpanded ? "Show less" : "See more"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {leads.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-2 justify-between border-b last:border-0 py-2"
                    >
                      <div className="text-sm">{l.waterConcerns.join(", ")}</div>
                      <div className="flex items-center gap-2">
                        {l.quoteAmount && (
                          <span className="text-sm font-semibold">{money(l.quoteAmount)}</span>
                        )}
                        <StatusBadge status={l.status} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {jobs.length === 0 && (
                    <EmptyRecord
                      label="No jobs recorded for this customer."
                      action="Add job"
                      onClick={() => setRecordEditor({ type: "job" })}
                    />
                  )}
                  {jobs.map((j) => (
                    <div
                      key={j.id}
                      className="border-b last:border-0 py-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {j.invoiceNumber} · {j.systemType}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {shortDate(j.saleDate)} · {j.paymentStatus} · balance{" "}
                          {money(j.totalPrice - j.depositCollected)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={j.status} />
                        <EditRecordButton
                          label="Edit job"
                          onClick={() => setRecordEditor({ type: "job", recordId: j.id })}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="installs">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {installs.length === 0 && (
                    <EmptyRecord
                      label="No installations recorded for this customer."
                      action="Add installation"
                      onClick={() => setRecordEditor({ type: "installation" })}
                    />
                  )}
                  {installs.map((i) => (
                    <div
                      key={i.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b py-3 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {dateTime(i.startAt)} · {i.equipment.join(", ") || "Equipment not listed"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tech: {s.users.find((u) => u.id === i.technicianId)?.name || "Unassigned"}
                        </div>
                        {i.technicianNotes && (
                          <div className="text-xs mt-1">{i.technicianNotes}</div>
                        )}
                      </div>
                      <EditRecordButton
                        label="Edit installation"
                        onClick={() => setRecordEditor({ type: "installation", recordId: i.id })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {eqs.length === 0 && (
                    <EmptyRecord
                      label="No equipment recorded for this customer."
                      action="Add equipment"
                      onClick={() => setEquipmentEditor({})}
                    />
                  )}
                  {eqs.map((e) => (
                    <div
                      key={e.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b py-3 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {e.type} · {e.model}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          SN {e.serial} · installed {shortDate(e.installDate)} · warranty{" "}
                          {shortDate(e.warrantyExpires)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Next maintenance {shortDate(e.nextMaintenance)}
                        </div>
                      </div>
                      <EditRecordButton
                        label="Edit equipment"
                        onClick={() => setEquipmentEditor({ equipmentId: e.id })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {maints.length === 0 && (
                    <EmptyRecord
                      label="No maintenance recorded for this customer."
                      action="Add maintenance"
                      onClick={() => setRecordEditor({ type: "maintenance" })}
                    />
                  )}
                  {maints.map((m) => (
                    <div
                      key={m.id}
                      className="border-b last:border-0 py-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          Due {shortDate(m.dueDate)} ({relDays(m.dueDate)})
                        </div>
                        {m.workPerformed && (
                          <div className="text-xs text-muted-foreground">{m.workPerformed}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={m.status} />
                        <EditRecordButton
                          label="Edit maintenance"
                          onClick={() => setRecordEditor({ type: "maintenance", recordId: m.id })}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {tasks.length === 0 && (
                    <EmptyRecord
                      label="No tasks for this customer."
                      action="Add task"
                      onClick={() => setRecordEditor({ type: "task" })}
                    />
                  )}
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 border-b py-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <div
                          className={
                            t.done ? "text-sm line-through text-muted-foreground" : "text-sm"
                          }
                        >
                          {t.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Due {dateTime(t.dueAt)} · {t.priority} priority
                        </div>
                      </div>
                      <EditRecordButton
                        label="Edit task"
                        onClick={() => setRecordEditor({ type: "task", recordId: t.id })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {audit.slice(0, 20).map((a) => (
                    <div key={a.id} className="text-xs text-muted-foreground">
                      {dateTime(a.at)} — {s.users.find((u) => u.id === a.actorId)?.name} {a.action}{" "}
                      {a.entity} {a.detail && `· ${a.detail}`}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">Location</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-hidden rounded-lg border bg-muted">
              <iframe
                title={`Map for ${c.propertyAddress}`}
                src={mapEmbedUrl}
                className="aspect-[3/1] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex items-center gap-2 border-t bg-background px-3 py-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{c.propertyAddress}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      <EditCustomerDialog
        customer={c}
        open={customerEditorOpen}
        onOpenChange={setCustomerEditorOpen}
      />
      {recordEditor && (
        <RelatedRecordDialog
          customer={c}
          type={recordEditor.type}
          recordId={recordEditor.recordId}
          open
          onOpenChange={(open) => {
            if (!open) setRecordEditor(null);
          }}
        />
      )}
      {equipmentEditor && (
        <EquipmentDialog
          customer={c}
          equipmentId={equipmentEditor.equipmentId}
          open
          onOpenChange={(open) => {
            if (!open) setEquipmentEditor(null);
          }}
        />
      )}
    </>
  );
}

function EditRecordButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" aria-label={label} title={label} onClick={onClick}>
      <Pencil className="h-4 w-4" />
    </Button>
  );
}

function EmptyRecord({
  label,
  action,
  onClick,
}: {
  label: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ClipboardList className="h-4 w-4" />
        {label}
      </div>
      <Button variant="outline" size="sm" onClick={onClick}>
        <Plus className="h-4 w-4" />
        {action}
      </Button>
    </div>
  );
}
