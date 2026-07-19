import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initials, shortDate } from "@/lib/format";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HistoricalBadge } from "@/components/import/HistoricalBadge";

export const Route = createFileRoute("/customers")({ component: Customers });

function Customers() {
  const customers = useCRM((s) => s.customers);
  const [q, setQ] = useState("");
  const filtered = customers.filter((c) => `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.propertyAddress}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Customers"
        description={`${customers.length} customers`}
        actions={
          <Link to="/import-customers"><Button className="bg-primary">+ Add customer</Button></Link>
        }
      />
      <Section className="space-y-4">
        <Input placeholder="Search by name, email, phone, address..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="shadow-sm hover:shadow-card transition-shadow">
              <CardContent className="p-4">
                <Link to="/customers/$id" params={{ id: c.id }} className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full grid place-items-center text-xs font-semibold text-white shrink-0 bg-gradient-water">
                    {initials(`${c.firstName} ${c.lastName}`)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate flex items-center gap-1.5">{c.firstName} {c.lastName}{c.isHistorical && <HistoricalBadge />}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.phone}</div>
                    <div className="text-[11px] text-muted-foreground truncate mt-1">{c.propertyAddress}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-wider text-accent-foreground/70">
                      {c.leadSource} · added {shortDate(c.createdAt)}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
