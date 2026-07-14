import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";

export const Route = createFileRoute("/map")({ component: MapPage });

// San Antonio bbox
const B = { latMin: 29.35, latMax: 29.65, lngMin: -98.72, lngMax: -98.35 };

function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - B.lngMin) / (B.lngMax - B.lngMin)) * w;
  const y = h - ((lat - B.latMin) / (B.latMax - B.latMin)) * h;
  return { x, y };
}

function MapPage() {
  const s = useCRM();
  const [filter, setFilter] = useState<"all" | "unscheduled" | "maintenance-due">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const shown = useMemo(() => {
    return s.customers.filter((c) => {
      if (filter === "unscheduled") {
        const j = s.jobs.find((j) => j.customerId === c.id && j.status === "Ready to Schedule");
        return !!j;
      }
      if (filter === "maintenance-due") {
        return s.maintenance.some((m) => m.customerId === c.id && ["Due Within 7 Days", "Due Within 30 Days", "Maintenance Overdue"].includes(m.status));
      }
      return true;
    });
  }, [filter, s]);

  const sel = selected ? s.customers.find((c) => c.id === selected) : null;

  return (
    <>
      <PageHeader eyebrow="Field" title="Map" description="San Antonio service area · demo visualization (Mapbox/Google-ready)." />
      <Section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "unscheduled", "maintenance-due"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? "All customers" : f === "unscheduled" ? "Unscheduled installs" : "Maintenance due"}
            </Button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground self-center">{shown.length} pins</span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]">
                <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full">
                  {/* Highway grid decoration */}
                  <g stroke="#0369a1" strokeOpacity="0.15" strokeWidth="1">
                    {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 60} x2="800" y2={i * 60} />)}
                    {Array.from({ length: 14 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="600" />)}
                  </g>
                  {/* River */}
                  <path d="M 100 500 Q 300 300, 500 350 T 800 200" fill="none" stroke="#0891b2" strokeOpacity="0.4" strokeWidth="6" />
                  <text x="20" y="30" fontSize="14" fill="#0c4a6e" fontWeight="600">San Antonio</text>

                  {shown.map((c) => {
                    const { x, y } = project(c.lat, c.lng, 800, 600);
                    const isSel = c.id === selected;
                    const overdue = s.maintenance.some((m) => m.customerId === c.id && m.status === "Maintenance Overdue");
                    const color = overdue ? "#dc2626" : "#0891b2";
                    return (
                      <g key={c.id} className="cursor-pointer" onClick={() => setSelected(c.id)}>
                        <circle cx={x} cy={y} r={isSel ? 10 : 6} fill={color} stroke="white" strokeWidth="2" />
                        {isSel && <circle cx={x} cy={y} r="16" fill={color} fillOpacity="0.25" />}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardContent className="p-4">
              {sel ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    <div className="font-semibold">{sel.firstName} {sel.lastName}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{sel.propertyAddress}</div>
                  <div className="text-xs">{sel.phone} · {sel.email}</div>
                  <Link to="/customers/$id" params={{ id: sel.id }} className="inline-block mt-2 text-xs text-primary hover:underline">Open profile →</Link>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Click a pin to see customer details, or use filters to plan a route.</div>
              )}
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <div className="font-medium text-foreground mb-1">Route planning</div>
                Select multiple nearby customers to auto-order a route with estimated travel times (demo).
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
