import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useState } from "react";
import { Play, Square } from "lucide-react";

type Entry = { id: string; tech: string; date: string; clockIn: string; clockOut: string | null; hours: number; job?: string; approved: boolean };

const seed: Entry[] = [
  { id: "t1", tech: "Ricky Alvarez", date: "2026-07-18", clockIn: "07:52", clockOut: "16:31", hours: 8.65, job: "JOB-118", approved: false },
  { id: "t2", tech: "Sam Ortiz", date: "2026-07-18", clockIn: "08:05", clockOut: "17:14", hours: 9.15, job: "JOB-117", approved: false },
  { id: "t3", tech: "Ricky Alvarez", date: "2026-07-17", clockIn: "07:48", clockOut: "16:12", hours: 8.40, approved: true },
];

export const Route = createFileRoute("/timesheets")({ component: TimesheetsPage });

function TimesheetsPage() {
  const [rows, setRows] = useState(seed);
  const [running, setRunning] = useState<{ start: number } | null>(null);
  const pending = rows.filter(r => !r.approved);
  const totalHrs = rows.reduce((s, r) => s + r.hours, 0);
  return (
    <>
      <PageHeader eyebrow="Payroll" title="Timesheets" description="Clock in/out, approve, and confirm payroll" actions={
        running
          ? <Button size="sm" variant="destructive" onClick={() => { const mins = (Date.now() - running.start) / 60000; setRunning(null); toast.success(`Clocked out (${mins.toFixed(0)}m)`); }}><Square className="h-3 w-3 mr-1" />Clock out</Button>
          : <Button size="sm" onClick={() => { setRunning({ start: Date.now() }); toast.success("Clocked in"); }}><Play className="h-3 w-3 mr-1" />Clock in</Button>
      } />
      <Section className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Hours this week</div><div className="text-2xl font-bold">{totalHrs.toFixed(1)}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Pending approval</div><div className="text-2xl font-bold text-amber-600">{pending.length}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Est. payroll</div><div className="text-2xl font-bold">${(totalHrs * 32).toFixed(0)}</div></CardContent></Card>
        </div>
        <Card><CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <div className="font-semibold">Daily / Weekly log</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setRows(x => x.map(y => ({...y, approved: true}))); toast.success("All timesheets approved"); }}>Approve all</Button>
              <Button size="sm" onClick={() => toast.success("Payroll confirmed and exported")}>Confirm payroll</Button>
            </div>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Tech</TableHead><TableHead>In</TableHead><TableHead>Out</TableHead><TableHead>Hours</TableHead><TableHead>Job</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.date}</TableCell><TableCell>{r.tech}</TableCell><TableCell>{r.clockIn}</TableCell>
                  <TableCell>{r.clockOut ?? "—"}</TableCell><TableCell>{r.hours.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{r.job ?? "—"}</TableCell>
                  <TableCell>{r.approved ? <Badge>Approved</Badge> : <Badge variant="secondary">Pending</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </Section>
    </>
  );
}
