import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";

type Invoice = {
  id: string; number: string; customer: string; jobRef?: string;
  amount: number; paid: number; issuedAt: string; dueAt: string;
  status: "Draft" | "Sent" | "Partial" | "Paid" | "Overdue";
};

const seed: Invoice[] = [
  { id: "i1", number: "INV-2041", customer: "Marcus Lee", jobRef: "JOB-118", amount: 1450, paid: 725, issuedAt: "2026-07-10", dueAt: "2026-07-24", status: "Partial" },
  { id: "i2", number: "INV-2040", customer: "Ana Ruiz", amount: 3200, paid: 0, issuedAt: "2026-07-05", dueAt: "2026-07-05", status: "Overdue" },
  { id: "i3", number: "INV-2039", customer: "Jamie Cole", jobRef: "JOB-114", amount: 780, paid: 780, issuedAt: "2026-06-28", dueAt: "2026-07-12", status: "Paid" },
];

export const Route = createFileRoute("/invoices")({ component: InvoicesPage });

function InvoicesPage() {
  const [rows, setRows] = useState(seed);
  const totals = rows.reduce((a, r) => ({ owed: a.owed + (r.amount - r.paid), paid: a.paid + r.paid }), { owed: 0, paid: 0 });
  return (
    <>
      <PageHeader eyebrow="Financials" title="Invoices" description="One-click convert jobs to invoices" actions={<Button size="sm">New invoice</Button>} />
      <Section className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <StatCard label="Outstanding" value={`$${totals.owed.toLocaleString()}`} tone="warning" />
          <StatCard label="Collected (MTD)" value={`$${totals.paid.toLocaleString()}`} tone="success" />
          <StatCard label="Overdue" value={rows.filter(r => r.status === "Overdue").length.toString()} tone="danger" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>#</TableHead><TableHead>Customer</TableHead><TableHead>Job</TableHead><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.number}</TableCell>
                    <TableCell>{r.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{r.jobRef ?? "—"}</TableCell>
                    <TableCell>${r.amount.toLocaleString()}</TableCell>
                    <TableCell>${r.paid.toLocaleString()}</TableCell>
                    <TableCell>{r.dueAt}</TableCell>
                    <TableCell><Badge variant={r.status === "Paid" ? "default" : r.status === "Overdue" ? "destructive" : "secondary"}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => { setRows(x => x.map(y => y.id === r.id ? {...y, paid: y.amount, status: "Paid"} : y)); toast.success("Payment recorded"); }}>Mark paid</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "danger" }) {
  const cls = tone === "success" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : "text-red-600";
  return (
    <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className={`text-2xl font-bold ${cls}`}>{value}</div></CardContent></Card>
  );
}
