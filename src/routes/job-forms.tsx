import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";

type Form = { id: string; name: string; type: "Checklist" | "Form"; fields: string[] };

const forms: Form[] = [
  { id: "f1", name: "Softener install checklist", type: "Checklist", fields: ["Site survey complete", "Water hardness tested", "Bypass valve installed", "Brine line secured", "Programmed regeneration", "Customer walk-through", "Photos uploaded"] },
  { id: "f2", name: "RO drinking install", type: "Checklist", fields: ["Under-sink space verified", "Faucet mounted", "Membrane flushed", "Leak check 15min", "TDS reading recorded"] },
  { id: "f3", name: "Annual maintenance form", type: "Form", fields: ["Salt level %", "Bypass tested", "Resin cleaner applied", "Pre/post TDS", "Customer signature"] },
  { id: "f4", name: "Water quality test", type: "Form", fields: ["Hardness (gpg)", "Iron (ppm)", "pH", "Chlorine (ppm)", "TDS", "Recommendation"] },
];

export const Route = createFileRoute("/job-forms")({ component: JobFormsPage });

function JobFormsPage() {
  const [active, setActive] = useState(forms[0]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  return (
    <>
      <PageHeader eyebrow="Field" title="Job Forms & Checklists" description="Standardize field work with required steps and captured data" actions={<Button size="sm">New form</Button>} />
      <Section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1"><CardContent className="p-0 divide-y">
          {forms.map(f => (
            <button key={f.id} onClick={() => { setActive(f); setChecked(new Set()); }} className={`w-full text-left p-3 hover:bg-accent transition ${active.id === f.id ? "bg-accent" : ""}`}>
              <div className="flex items-center gap-2"><div className="font-medium text-sm">{f.name}</div><Badge variant="outline" className="text-[10px]">{f.type}</Badge></div>
              <div className="text-xs text-muted-foreground">{f.fields.length} items</div>
            </button>
          ))}
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div><div className="font-semibold">{active.name}</div><div className="text-xs text-muted-foreground">{active.type} · attach to any job</div></div>
            <Button size="sm" variant="outline" onClick={() => toast.success(`Submitted (${checked.size}/${active.fields.length})`)}>Submit</Button>
          </div>
          <div className="space-y-2">
            {active.fields.map(f => (
              <label key={f} className="flex items-center gap-3 p-2 border rounded-lg text-sm">
                <Checkbox checked={checked.has(f)} onCheckedChange={(v) => { const n = new Set(checked); v ? n.add(f) : n.delete(f); setChecked(n); }} />
                <span className={checked.has(f) ? "line-through text-muted-foreground" : ""}>{f}</span>
              </label>
            ))}
          </div>
        </CardContent></Card>
      </Section>
    </>
  );
}
