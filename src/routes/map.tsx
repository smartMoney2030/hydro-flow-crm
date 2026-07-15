import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";

export const Route = createFileRoute("/map")({ component: MapPage });

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

declare global {
  interface Window {
    google?: any;
    __initMWPMap?: () => void;
    __mwpMapReady?: boolean;
  }
}

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__mwpMapReady && window.google?.maps) return Promise.resolve();
  if (!BROWSER_KEY) return Promise.reject(new Error("Missing Google Maps browser key"));

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("google-maps-js") as HTMLScriptElement | null;
    window.__initMWPMap = () => {
      window.__mwpMapReady = true;
      resolve();
    };
    if (existing) {
      if (window.google?.maps) resolve();
      return;
    }
    const s = document.createElement("script");
    s.id = "google-maps-js";
    const params = new URLSearchParams({ key: BROWSER_KEY, loading: "async", callback: "__initMWPMap", libraries: "marker" });
    if (TRACKING_ID) params.set("channel", TRACKING_ID);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

function MapPage() {
  const s = useCRM();
  const [filter, setFilter] = useState<"all" | "unscheduled" | "maintenance-due">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapDivRef.current || !window.google?.maps) return;
        mapRef.current = new window.google.maps.Map(mapDivRef.current, {
          center: { lat: 29.4241, lng: -98.4936 },
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setReady(true);
      })
      .catch((e) => setError(e.message ?? String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    shown.forEach((c) => {
      const overdue = s.maintenance.some((m) => m.customerId === c.id && m.status === "Maintenance Overdue");
      const color = overdue ? "#dc2626" : "#0891b2";
      const marker = new window.google.maps.Marker({
        position: { lat: c.lat, lng: c.lng },
        map: mapRef.current,
        title: `${c.firstName} ${c.lastName}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => setSelected(c.id));
      markersRef.current.push(marker);
      bounds.extend({ lat: c.lat, lng: c.lng });
    });
    if (shown.length > 1) mapRef.current.fitBounds(bounds, 40);
  }, [ready, shown, s.maintenance]);

  return (
    <>
      <PageHeader eyebrow="Field" title="Map" description="San Antonio service area · powered by Google Maps." />
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
              <div className="relative aspect-[4/3] bg-muted">
                <div ref={mapDivRef} className="absolute inset-0 w-full h-full" />
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-destructive">
                    {error}
                  </div>
                )}
                {!ready && !error && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    Loading map…
                  </div>
                )}
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
