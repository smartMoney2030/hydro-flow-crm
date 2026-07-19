import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const stock = [
  { id: "c1", name: "Sodium chloride pellets (40lb)", sku: "SLT-40", onHand: 68, reorder: 40, unit: "bag" },
  { id: "c2", name: "Potassium chloride (40lb)", sku: "KCL-40", onHand: 12, reorder: 20, unit: "bag" },
  { id: "c3", name: "Resin cleaner (1gal)", sku: "RC-1G", onHand: 4, reorder: 6, unit: "gal" },
  { id: "c4", name: "RO membrane sanitizer", sku: "RO-SAN", onHand: 21, reorder: 10, unit: "kit" },
];

const usage = [
  { id: "u1", date: "2026-07-15", tech: "Ricky Alvarez", job: "JOB-118", item: "SLT-40", qty: 4 },
  { id: "u2", date: "2026-07-14", tech: "Sam Ortiz", job: "JOB-117", item: "RO-SAN", qty: 1 },
];

export const Route = createFileRoute("/chemicals")({ component: ChemicalsPage });

function ChemicalsPage() {
  return (
    <>
      <PageHeader eyebrow="Inventory" title="Chemicals & Consumables" description="Track salt, resin, and treatment inventory" actions={<Button size="sm">Log usage</Button>} />
      <Section className="grid gap-4 lg:grid-cols-2">
        <Card><CardContent className="p-0">
          <div className="p-4 font-semibold">Stock on hand</div>
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>SKU</TableHead><TableHead>Level</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {stock.map(s => {
                const pct = Math.min(100, (s.onHand / (s.reorder * 2)) * 100);
                const low = s.onHand < s.reorder;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.sku}</TableCell>
                    <TableCell className="w-40"><div className="text-xs mb-1">{s.onHand} {s.unit}</div><Progress value={pct} /></TableCell>
                    <TableCell>{low ? <Badge variant="destructive">Reorder</Badge> : <Badge>OK</Badge>}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent></Card>
        <Card><CardContent className="p-0">
          <div className="p-4 font-semibold">Recent field usage</div>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Tech</TableHead><TableHead>Job</TableHead><TableHead>Item</TableHead><TableHead>Qty</TableHead></TableRow></TableHeader>
            <TableBody>
              {usage.map(u => <TableRow key={u.id}><TableCell>{u.date}</TableCell><TableCell>{u.tech}</TableCell><TableCell className="text-muted-foreground">{u.job}</TableCell><TableCell>{u.item}</TableCell><TableCell>{u.qty}</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent></Card>
      </Section>
    </>
  );
}
