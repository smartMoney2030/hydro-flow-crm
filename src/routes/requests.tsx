import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Globe, PhoneCall, Mail } from "lucide-react";

type Req = {
  id: string; name: string; phone: string; email: string; address: string;
  service: string; notes: string; source: "Website" | "Phone" | "Referral"; createdAt: string; status: "New" | "Contacted" | "Converted" | "Archived";
};

const seed: Req[] = [
  { id: "r1", name: "Ana Ruiz", phone: "(210) 555-2231", email: "ana@example.com", address: "142 Elm St, San Antonio TX", service: "Whole-home softener quote", notes: "Hard water spots on glassware.", source: "Website", createdAt: new Date(Date.now() - 3600e3).toISOString(), status: "New" },
  { id: "r2", name: "Marcus Lee", phone: "(210) 555-9910", email: "marcus@example.com", address: "88 Oak Ridge, Boerne TX", service: "RO drinking system", notes: "Wants under-sink install.", source: "Referral", createdAt: new Date(Date.now() - 86400e3).toISOString(), status: "Contacted" },
];

export const Route = createFileRoute("/requests")({ component: RequestsPage });

function RequestsPage() {
  const [reqs, setReqs] = useState<Req[]>(seed);
  const embed = `<iframe src="https://mywaterpeople.com/request" width="100%" height="640" style="border:0;border-radius:12px" />`;
  return (
    <>
      <PageHeader eyebrow="Intake" title="Requests" description="Online request forms and inbound inquiries" actions={
        <NewRequestDialog onCreate={(r) => setReqs((x) => [r, ...x])} />
      } />
      <Section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0 divide-y">
            {reqs.map((r) => (
              <div key={r.id} className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent grid place-items-center text-xs font-semibold">{r.name.split(" ").map(s=>s[0]).join("")}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{r.name}</div>
                    <Badge variant="outline" className="text-[10px]">{r.source}</Badge>
                    <Badge className="text-[10px]" variant={r.status === "New" ? "default" : "secondary"}>{r.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{r.service}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className="flex items-center gap-1"><PhoneCall className="h-3 w-3" />{r.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>
                    <span>{r.address}</span>
                  </div>
                  {r.notes && <div className="text-xs mt-1 italic text-muted-foreground">"{r.notes}"</div>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setReqs((x) => x.map(y => y.id === r.id ? {...y, status: "Converted"} : y)); toast.success("Converted to lead"); }}>Convert to Lead</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><Globe className="h-4 w-4" /> Embeddable form</div>
            <p className="text-xs text-muted-foreground">Paste this snippet into your website to accept requests directly into the CRM.</p>
            <Textarea readOnly value={embed} className="font-mono text-xs h-28" />
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(embed); toast.success("Copied"); }}><Copy className="h-3 w-3 mr-1" />Copy embed code</Button>
            <div className="pt-3 border-t text-xs text-muted-foreground">Public URL: <code>mywaterpeople.com/request</code></div>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}

function NewRequestDialog({ onCreate }: { onCreate: (r: Req) => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", service: "", notes: "" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">New request</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Log a new request</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          {(["name","phone","email","address","service"] as const).map(k => (
            <div key={k}><Label className="capitalize">{k}</Label><Input value={f[k]} onChange={(e) => setF({...f,[k]:e.target.value})} /></div>
          ))}
          <div><Label>Notes</Label><Textarea value={f.notes} onChange={(e)=>setF({...f,notes:e.target.value})} /></div>
        </div>
        <DialogFooter>
          <Button onClick={() => { onCreate({ id: crypto.randomUUID(), ...f, source: "Phone", createdAt: new Date().toISOString(), status: "New" }); setOpen(false); toast.success("Request logged"); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
