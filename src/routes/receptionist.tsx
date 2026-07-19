import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PhoneIncoming, Bot } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const calls = [
  { id: "c1", from: "(210) 555-4477", name: "Marissa T.", time: "6:42 PM", intent: "New quote — softener", transcript: "Hi, I'd like a quote for a whole-home softener. My water is really hard.", handled: true, appointment: "Tomorrow 10 AM" },
  { id: "c2", from: "(830) 555-1201", name: "Unknown", time: "5:18 PM", intent: "Existing customer — service", transcript: "My RO drinking tap is slow. Can someone look at it?", handled: true, appointment: "Friday 2 PM" },
  { id: "c3", from: "(210) 555-9820", name: "Ken W.", time: "3:11 PM", intent: "Pricing question", transcript: "Rough cost for a salt-free system?", handled: true, appointment: "—" },
];

export const Route = createFileRoute("/receptionist")({ component: ReceptionistPage });

function ReceptionistPage() {
  const [on, setOn] = useState(true);
  return (
    <>
      <PageHeader eyebrow="AI Add-on" title="AI Receptionist" description="Answers after-hours calls and books appointments" actions={
        <div className="flex items-center gap-2 text-sm"><Switch checked={on} onCheckedChange={(v) => { setOn(v); toast.success(v ? "Receptionist enabled" : "Receptionist paused"); }} />{on ? "Active" : "Paused"}</div>
      } />
      <Section className="space-y-4">
        <Card><CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center"><Bot className="h-6 w-6 text-primary" /></div>
          <div className="flex-1 min-w-[240px]">
            <div className="font-semibold">Forwarding after-hours calls</div>
            <div className="text-xs text-muted-foreground">Mon–Fri after 6 PM, weekends all day. Calls answered in under 2 rings.</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold">28</div><div className="text-[10px] text-muted-foreground">Calls (30d)</div></div>
            <div><div className="text-2xl font-bold">17</div><div className="text-[10px] text-muted-foreground">Booked</div></div>
            <div><div className="text-2xl font-bold">61%</div><div className="text-[10px] text-muted-foreground">Book rate</div></div>
          </div>
        </CardContent></Card>
        <div className="grid gap-2">
          {calls.map(c => (
            <Card key={c.id}><CardContent className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <PhoneIncoming className="h-4 w-4 text-primary mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.from} · {c.time}</div><Badge variant="outline" className="ml-auto">{c.intent}</Badge></div>
                  <div className="text-sm mt-1 italic text-muted-foreground">"{c.transcript}"</div>
                  <div className="text-xs mt-1">Booked: <span className="font-medium">{c.appointment}</span></div>
                </div>
                <Button size="sm" variant="outline">Assign lead</Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      </Section>
    </>
  );
}
