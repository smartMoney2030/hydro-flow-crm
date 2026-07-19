import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Play, Square } from "lucide-react";
import { useCRM } from "@/store/crm";

type Entry = { id: string; tech: string; date: string; clockIn: string; clockOut: string | null; hours: number; job?: string; approved: boolean };

const seed: Entry[] = [
  { id: "t1", tech: "Ricky Alvarez", date: "2026-07-18", clockIn: "07:52", clockOut: "16:31", hours: 8.65, job: "JOB-118", approved: false },
  { id: "t2", tech: "Sam Ortiz", date: "2026-07-18", clockIn: "08:05", clockOut: "17:14", hours: 9.15, job: "JOB-117", approved: false },
  { id: "t3", tech: "Ricky Alvarez", date: "2026-07-17", clockIn: "07:48", clockOut: "16:12", hours: 8.40, approved: true },
];

const pad = (n: number) => n.toString().padStart(2, "0");
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const Route = createFileRoute("/timesheets")({ component: TimesheetsPage });

function TimesheetsPage() {
  const currentUserId = useCRM((s) => s.currentUserId);
  const users = useCRM((s) => s.users);
  const currentUser = users.find((u) => u.id === currentUserId);
  const currentName = currentUser?.name ?? "You";

  const [rows, setRows] = useState(seed);
  const [sessions, setSessions] = useState<Record<string, { start: number }>>({});
  const running = sessions[currentUserId] ?? null;

  const pending = rows.filter((r) => !r.approved);
  const totalHrs = useMemo(() => rows.reduce((s, r) => s + r.hours, 0), [rows]);

  const clockIn = () => {
    setSessions((s) => ({ ...s, [currentUserId]: { start: Date.now() } }));
    toast.success(`${currentName} clocked in`);
  };
  const clockOut = () => {
    if (!running) return;
    const startD = new Date(running.start);
    const endD = new Date();
    const hours = (endD.getTime() - startD.getTime()) / 3600000;
    setRows((x) => [
      { id: `t${Date.now()}`, tech: currentName, date: ymd(endD), clockIn: hhmm(startD), clockOut: hhmm(endD), hours: Math.max(hours, 0.01), approved: false },
      ...x,
    ]);
    setSessions((s) => {
      const next = { ...s };
      delete next[currentUserId];
      return next;
    });
    toast.success(`${currentName} clocked out (${(hours * 60).toFixed(0)}m)`);
  };

  return (
    <>
      <PageHeader eyebrow="Payroll" title="Timesheets" description={`Clock in/out, approve, and confirm payroll · ${currentName} (${currentUser?.role ?? "—"})`} actions={
        running
          ? <Button size="sm" variant="destructive" onClick={clockOut}><Square className="h-3 w-3 mr-1" />Clock out</Button>
          : <Button size="sm" onClick={clockIn}><Play className="h-3 w-3 mr-1" />Clock in</Button>
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
