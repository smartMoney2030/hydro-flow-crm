import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addDays, startOfWeek, format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

const typeColor: Record<string, string> = {
  installation: "bg-accent/40 text-primary border-accent",
  maintenance: "bg-success/30 text-success border-success/40",
  "sales-call": "bg-info/30 text-info border-info/40",
  "follow-up": "bg-warning/30 text-warning-foreground border-warning/40",
  "time-off": "bg-muted text-muted-foreground border-border",
};

function CalendarPage() {
  const s = useCRM();
  const [anchor, setAnchor] = useState(new Date());
  const [view, setView] = useState<"week" | "day" | "tech">("week");
  const [techFilter, setTechFilter] = useState<string>("all");

  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filtered = s.events.filter((e) => techFilter === "all" || e.technicianId === techFilter);

  return (
    <>
      <PageHeader
        eyebrow="Scheduling"
        title="Calendar"
        description="Sales calls, installs, maintenance, and technician availability."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setAnchor(addDays(anchor, -7))}>‹</Button>
            <Button size="sm" variant="outline" onClick={() => setAnchor(new Date())}>Today</Button>
            <Button size="sm" variant="outline" onClick={() => setAnchor(addDays(anchor, 7))}>›</Button>
          </>
        }
      />
      <Section className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex rounded-md border p-0.5">
            {(["week", "day", "tech"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-xs rounded ${view === v ? "bg-primary text-primary-foreground" : ""}`}>{v}</button>
            ))}
          </div>
          <select className="border rounded-md text-xs px-2 py-1.5 bg-background" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
            <option value="all">All technicians</option>
            {s.users.filter((u) => u.role === "technician").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <span className="text-sm text-muted-foreground ml-auto">{format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}</span>
        </div>

        {view === "week" && (
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const dayEvents = filtered.filter((e) => isSameDay(new Date(e.startAt), d));
              return (
                <Card key={d.toISOString()} className={`min-h-[280px] ${isSameDay(d, new Date()) ? "border-primary" : ""}`}>
                  <CardContent className="p-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-2">{format(d, "EEE d")}</div>
                    <div className="space-y-1">
                      {dayEvents.map((e) => (
                        <div key={e.id} className={`text-[11px] rounded p-1.5 border ${typeColor[e.type]}`}>
                          <div className="font-medium truncate">{format(new Date(e.startAt), "h:mma")}</div>
                          <div className="truncate">{e.title}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {view === "day" && (
          <Card><CardContent className="p-4 space-y-2">
            {filtered.filter((e) => isSameDay(new Date(e.startAt), anchor)).map((e) => (
              <div key={e.id} className={`p-3 rounded border ${typeColor[e.type]}`}>
                <div className="font-medium">{e.title}</div>
                <div className="text-xs">{format(new Date(e.startAt), "h:mm a")} – {format(new Date(e.endAt), "h:mm a")}</div>
              </div>
            ))}
          </CardContent></Card>
        )}

        {view === "tech" && (
          <div className="space-y-3">
            {s.users.filter((u) => u.role === "technician").map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold text-white" style={{ backgroundColor: u.avatarColor }}>{u.name[0]}</div>
                    <div className="font-medium">{u.name}</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((d) => {
                      const evs = s.events.filter((e) => e.technicianId === u.id && isSameDay(new Date(e.startAt), d));
                      return (
                        <div key={d.toISOString()} className="min-h-[80px] rounded bg-muted/40 p-1.5 space-y-1">
                          <div className="text-[10px] text-muted-foreground">{format(d, "EEE d")}</div>
                          {evs.map((e) => <div key={e.id} className={`text-[10px] p-1 rounded border ${typeColor[e.type]} truncate`}>{e.title}</div>)}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="p-4 flex flex-wrap gap-2 items-center text-xs">
            <span className="font-medium">Legend:</span>
            {Object.entries(typeColor).map(([k, v]) => (
              <Badge key={k} variant="outline" className={v}>{k}</Badge>
            ))}
            <span className="ml-auto text-muted-foreground">Travel buffer: 15 min · Google Calendar sync: <b>Off</b></span>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
