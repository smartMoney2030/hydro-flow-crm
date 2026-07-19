import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const rows = [
  { id: "e1", date: "2026-07-15", vendor: "Ferguson", category: "Parts", job: "JOB-118", amount: 214.5, billable: true },
  { id: "e2", date: "2026-07-13", vendor: "Chevron", category: "Fuel", job: "—", amount: 68.22, billable: false },
  { id: "e3", date: "2026-07-10", vendor: "Home Depot", category: "Supplies", job: "JOB-117", amount: 92.10, billable: true },
];

export const Route = createFileRoute("/expenses")({ component: ExpensesPage });

function ExpensesPage() {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const billable = rows.filter(r => r.billable).reduce((s, r) => s + r.amount, 0);
  return (
    <>
      <PageHeader eyebrow="Financials" title="Expenses" description="Track spending against jobs for accurate margins" actions={<Button size="sm">Add expense</Button>} />
      <Section className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">This month</div><div className="text-2xl font-bold">${total.toFixed(2)}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Billable to jobs</div><div className="text-2xl font-bold text-emerald-600">${billable.toFixed(2)}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Overhead</div><div className="text-2xl font-bold">${(total - billable).toFixed(2)}</div></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Vendor</TableHead><TableHead>Category</TableHead><TableHead>Job</TableHead><TableHead>Amount</TableHead><TableHead>Billable</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell><TableCell>{r.vendor}</TableCell><TableCell>{r.category}</TableCell>
                    <TableCell className="text-muted-foreground">{r.job}</TableCell>
                    <TableCell>${r.amount.toFixed(2)}</TableCell>
                    <TableCell>{r.billable ? <Badge>Billable</Badge> : <Badge variant="secondary">Overhead</Badge>}</TableCell>
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
