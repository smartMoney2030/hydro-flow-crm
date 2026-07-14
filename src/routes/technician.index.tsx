import { createFileRoute, Link } from "@tanstack/react-router";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { time, initials } from "@/lib/format";
import { Phone, MapPin, ArrowRight, Droplet } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/technician/")({ component: TechHome });

function TechHome() {
  const s = useCRM();
  const uid = s.users.find((u) => u.role === "technician")!.id;
  const today = new Date();
  const jobs = useMemo(
    () => s.installations.filter((i) => i.technicianId === uid && new Date(i.startAt).toDateString() === today.toDateString()),
    [s.installations, uid],
  );
  const upcoming = s.installations.filter((i) => i.technicianId === uid && new Date(i.startAt) > today && i.status !== "Completed").slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-soft pb-8">
      <header className="bg-gradient-hero text-white px-4 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-white/20 backdrop-blur">
            <Droplet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs opacity-80">My Water People</div>
            <div className="font-bold text-lg">Technician</div>
          </div>
        </div>
        <div className="mt-5">
          <div className="text-xs opacity-80">{today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
          <div className="text-2xl font-bold">{jobs.length} appointments today</div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's schedule</h2>
        {jobs.length === 0 && <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No appointments scheduled for today.</CardContent></Card>}
        {jobs.map((i) => {
          const c = s.customers.find((c) => c.id === i.customerId)!;
          return (
            <Card key={i.id} className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-primary font-semibold">{time(i.startAt)} – {time(i.endAt)}</div>
                    <div className="font-semibold text-base truncate">{c.firstName} {c.lastName}</div>
                    <div className="text-xs text-muted-foreground truncate">{i.equipment.join(", ")}</div>
                  </div>
                  <div className="h-10 w-10 rounded-full grid place-items-center text-xs font-semibold text-white bg-gradient-water shrink-0">
                    {initials(`${c.firstName} ${c.lastName}`)}
                  </div>
                </div>
                <div className="text-xs bg-muted/60 rounded p-2">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {i.address}
                </div>
                {i.instructions && <div className="text-xs bg-warning/10 border border-warning/20 rounded p-2">💡 {i.instructions}</div>}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild><a href={`tel:${c.phone}`}><Phone className="h-4 w-4 mr-1" />Call</a></Button>
                  <Button variant="outline" size="sm"><MapPin className="h-4 w-4 mr-1" />Navigate</Button>
                </div>
                <Button asChild className="w-full bg-primary" size="lg">
                  <Link to="/technician/job/$id" params={{ id: i.id }}>Start Job <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {upcoming.length > 0 && (
          <>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4">Coming up</h2>
            {upcoming.map((i) => {
              const c = s.customers.find((c) => c.id === i.customerId)!;
              return (
                <Card key={i.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{new Date(i.startAt).toLocaleDateString()} · {time(i.startAt)}</div>
                      <div className="font-medium text-sm truncate">{c.firstName} {c.lastName}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
