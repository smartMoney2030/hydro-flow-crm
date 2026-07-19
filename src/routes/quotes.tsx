import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { FileSignature, DollarSign, Send } from "lucide-react";

type Tier = { name: string; price: number; features: string[] };
type Quote = {
  id: string; number: string; customer: string; email: string;
  tiers: Tier[]; selectedTier?: string;
  status: "Draft" | "Sent" | "Viewed" | "Approved" | "Declined";
  depositPct: number; signed: boolean; createdAt: string;
};

const seed: Quote[] = [
  {
    id: "q1", number: "Q-1042", customer: "Ana Ruiz", email: "ana@example.com",
    tiers: [
      { name: "Standard", price: 3200, features: ["Whole-home softener", "Basic install", "1yr warranty"] },
      { name: "Premium", price: 4800, features: ["Softener + RO drinking", "Premium install", "5yr warranty", "1st year maintenance"] },
    ],
    status: "Sent", depositPct: 25, signed: false, createdAt: new Date().toISOString(),
  },
  {
    id: "q2", number: "Q-1043", customer: "Marcus Lee", email: "marcus@example.com",
    tiers: [{ name: "RO Under-sink", price: 1450, features: ["4-stage RO", "Faucet included", "Install"] }],
    status: "Approved", selectedTier: "RO Under-sink", depositPct: 50, signed: true, createdAt: new Date().toISOString(),
  },
];

export const Route = createFileRoute("/quotes")({ component: QuotesPage });

function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(seed);
  return (
    <>
      <PageHeader eyebrow="Sales" title="Quotes & Estimates" description="Professional quotes with e-signature and deposits" actions={<Button size="sm">New quote</Button>} />
      <Section className="space-y-3">
        {quotes.map((q) => {
          const selected = q.tiers.find(t => t.name === q.selectedTier) ?? q.tiers[0];
          const deposit = Math.round(selected.price * (q.depositPct / 100));
          return (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{q.number} · {q.customer}</div>
                      <Badge variant={q.status === "Approved" ? "default" : "secondary"}>{q.status}</Badge>
                      {q.signed && <Badge variant="outline" className="text-emerald-600"><FileSignature className="h-3 w-3 mr-1" />Signed</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{q.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">${selected.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Deposit ${deposit.toLocaleString()} ({q.depositPct}%)</div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {q.tiers.map((t) => (
                    <div key={t.name} className={`border rounded-lg p-3 ${q.selectedTier === t.name ? "border-primary bg-primary/5" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{t.name}</div>
                        <div className="font-semibold">${t.price.toLocaleString()}</div>
                      </div>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {t.features.map(f => <li key={f}>• {f}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Sent ${q.number} to ${q.email}`)}><Send className="h-3 w-3 mr-1" />Send</Button>
                  <Button size="sm" variant="outline" onClick={() => { setQuotes(x => x.map(y => y.id === q.id ? {...y, signed: true, status: "Approved"} : y)); toast.success("E-sign recorded"); }}><FileSignature className="h-3 w-3 mr-1" />Request e-signature</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Deposit of $${deposit} requested`)}><DollarSign className="h-3 w-3 mr-1" />Collect deposit</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </Section>
    </>
  );
}
