import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { money, relDays } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { LeadStatus } from "@/data/types";

const STATUSES: LeadStatus[] = ["New Lead", "Contact Attempted", "Sales Call Scheduled", "Qualified", "Quote Sent", "Follow-Up", "Sale Won", "Sale Lost"];

export const Route = createFileRoute("/leads")({ component: LeadsPage });

function LeadsPage() {
  const leads = useCRM((s) => s.leads);
  const customers = useCRM((s) => s.customers);
  const users = useCRM((s) => s.users);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = leads.filter((l) => {
    const c = customers.find((c) => c.id === l.customerId)!;
    const matchesQ = !q || `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase());
    const matchesS = status === "all" || l.status === status;
    return matchesQ && matchesS;
  });

  return (
    <>
      <PageHeader eyebrow="Sales" title="Leads" description={`${leads.length} leads in pipeline`} actions={<Button className="bg-primary">+ New lead</Button>} />
      <Section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Search leads..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          {filtered.map((l) => {
            const c = customers.find((c) => c.id === l.customerId)!;
            const u = users.find((u) => u.id === l.assignedTo);
            return (
              <Card key={l.id} className="shadow-sm hover:shadow-card transition-shadow">
                <CardContent className="p-4">
                  <Link to="/customers/$id" params={{ id: c.id }} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.phone} · {c.email}</div>
                      <div className="mt-1 flex gap-1 flex-wrap">
                        {l.waterConcerns.map((w) => <span key={w} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{w}</span>)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{u?.name}</div>
                    <div className="text-sm font-semibold text-primary">{l.quoteAmount ? money(l.quoteAmount) : "—"}</div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={l.status} />
                      {l.followUpAt && <span className="text-[10px] text-muted-foreground">Follow-up {relDays(l.followUpAt)}</span>}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No leads match.</div>}
        </div>
      </Section>
    </>
  );
}
