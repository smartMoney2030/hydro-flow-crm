import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { money } from "@/lib/format";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

function ReportsPage() {
  const s = useCRM();
  const stages = ["New Lead", "Qualified", "Quote Sent", "Sale Won"] as const;
  const funnel = stages.map((st) => ({ stage: st, count: s.leads.filter((l) => l.status === st).length }));
  const revByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString("en-US", { month: "short" });
    return { month: label, revenue: 12000 + i * 3200 + (i % 2) * 2000 };
  });
  return (
    <>
      <PageHeader eyebrow="Insights" title="Reports" />
      <Section className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Sales funnel</CardTitle></CardHeader>
          <CardContent className="h-64"><ResponsiveContainer><BarChart data={funnel}><XAxis dataKey="stage" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#0891b2" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-base">Revenue trend</CardTitle></CardHeader>
          <CardContent className="h-64"><ResponsiveContainer><LineChart data={revByMonth}><XAxis dataKey="month" /><YAxis tickFormatter={(v) => `$${v/1000}k`} /><Tooltip formatter={(v: number) => money(v)} /><Line type="monotone" dataKey="revenue" stroke="#0891b2" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></CardContent>
        </Card>
      </Section>
    </>
  );
}
