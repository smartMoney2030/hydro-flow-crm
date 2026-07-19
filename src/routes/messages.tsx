import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare, Phone } from "lucide-react";

type Template = { id: string; name: string; channel: "Email" | "SMS"; body: string };

const seed: Template[] = [
  { id: "t1", name: "Appointment confirmation", channel: "SMS", body: "Hi {{name}}, this confirms your water service on {{date}} between {{window}}. Reply YES to confirm." },
  { id: "t2", name: "On the way", channel: "SMS", body: "Hi {{name}}, {{tech}} from My Water People is on the way and should arrive in about {{eta}} minutes." },
  { id: "t3", name: "Running late", channel: "SMS", body: "Hi {{name}}, sorry — {{tech}} is running about {{minutes}} min late. Thanks for your patience." },
  { id: "t4", name: "Quote follow-up", channel: "Email", body: "Hi {{name}}, just checking in on the quote for your water treatment install. Any questions?" },
  { id: "t5", name: "Invoice reminder", channel: "Email", body: "Hi {{name}}, invoice {{number}} for {{amount}} is due. You can pay securely at the link below." },
];

export const Route = createFileRoute("/messages")({ component: MessagesPage });

function MessagesPage() {
  const [tpls, setTpls] = useState(seed);
  const [active, setActive] = useState(seed[0]);
  return (
    <>
      <PageHeader eyebrow="Communications" title="Emails & Text Messages" description="Templates, dedicated number, and automated client reminders" actions={
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="text-emerald-600"><Phone className="h-3 w-3 mr-1" />(210) 555-WATER</Badge>
          <Button size="sm">New template</Button>
        </div>
      } />
      <Section className="grid gap-4 lg:grid-cols-3">
        <Card><CardContent className="p-0 divide-y">
          {tpls.map(t => (
            <button key={t.id} onClick={() => setActive(t)} className={`w-full text-left p-3 hover:bg-accent transition ${active.id === t.id ? "bg-accent" : ""}`}>
              <div className="flex items-center gap-2">
                {t.channel === "Email" ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                <div className="font-medium text-sm">{t.name}</div>
              </div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{t.body}</div>
            </button>
          ))}
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardContent className="p-4 space-y-3">
          <div><Label>Template name</Label><Input value={active.name} onChange={(e) => { const n = {...active, name: e.target.value}; setActive(n); setTpls(x => x.map(y => y.id === n.id ? n : y)); }} /></div>
          <div><Label>Body</Label><Textarea className="min-h-40" value={active.body} onChange={(e) => { const n = {...active, body: e.target.value}; setActive(n); setTpls(x => x.map(y => y.id === n.id ? n : y)); }} /></div>
          <div className="text-xs text-muted-foreground">Merge tags: <code>{"{{name}} {{date}} {{window}} {{tech}} {{eta}} {{number}} {{amount}}"}</code></div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => toast.success("Template saved")}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Test message sent")}>Send test</Button>
          </div>
        </CardContent></Card>
      </Section>
    </>
  );
}
