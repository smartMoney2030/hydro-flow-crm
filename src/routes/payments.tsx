import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Wallet, Building2 } from "lucide-react";

const rows = [
  { id: "p1", date: "2026-07-14", customer: "Marcus Lee", method: "Credit card", ref: "INV-2041", amount: 725, status: "Cleared" as const },
  { id: "p2", date: "2026-06-30", customer: "Jamie Cole", method: "Bank transfer", ref: "INV-2039", amount: 780, status: "Cleared" as const },
  { id: "p3", date: "2026-07-15", customer: "R. Ortiz", method: "Digital wallet", ref: "Deposit Q-1044", amount: 400, status: "Pending" as const },
];

export const Route = createFileRoute("/payments")({ component: PaymentsPage });

function PaymentsPage() {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return (
    <>
      <PageHeader eyebrow="Financials" title="Payments" description="Cards, bank transfers, and digital wallets" />
      <Section className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <MethodCard icon={<CreditCard className="h-4 w-4" />} label="Stripe (Cards)" status="Connected" />
          <MethodCard icon={<Building2 className="h-4 w-4" />} label="ACH / Bank transfer" status="Connected" />
          <MethodCard icon={<Wallet className="h-4 w-4" />} label="Apple / Google Pay" status="Connected" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between">
              <div className="font-semibold">Recent payments</div>
              <div className="text-sm text-muted-foreground">Total ${total.toLocaleString()}</div>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead>Method</TableHead><TableHead>Reference</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.customer}</TableCell>
                    <TableCell>{r.method}</TableCell>
                    <TableCell className="text-muted-foreground">{r.ref}</TableCell>
                    <TableCell>${r.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={r.status === "Cleared" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
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

function MethodCard({ icon, label, status }: { icon: React.ReactNode; label: string; status: string }) {
  return <Card><CardContent className="p-4 flex items-center justify-between"><div className="flex items-center gap-2 font-medium">{icon}{label}</div><Badge variant="outline" className="text-emerald-600">{status}</Badge></CardContent></Card>;
}
