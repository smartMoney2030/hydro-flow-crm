import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Camera, PenLine, Check } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export const Route = createFileRoute("/technician/job/$id")({
  component: TechJob,
  loader: ({ params }) => ({ id: params.id }),
});

function TechJob() {
  const { id } = Route.useLoaderData();
  const s = useCRM();
  const inst = s.installations.find((i) => i.id === id);
  if (!inst) throw notFound();
  const c = s.customers.find((c) => c.id === inst.customerId)!;

  const [notes, setNotes] = useState(inst.technicianNotes);
  const [serial, setSerial] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [photos, setPhotos] = useState(inst.beforePhotos + inst.afterPhotos);
  const [signed, setSigned] = useState(inst.signatureCaptured);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-hero text-white px-4 py-4 sticky top-0 z-10 flex items-center gap-3">
        <Link to="/technician"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="min-w-0">
          <div className="font-semibold truncate">{c.firstName} {c.lastName}</div>
          <div className="text-xs opacity-80 truncate">{inst.address}</div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        <Card><CardContent className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Equipment</div>
          <div className="text-sm">{inst.equipment.join(", ")}</div>
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instructions</div>
          <div className="text-sm">{inst.instructions}</div>
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add on-site notes..." />
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Record serial number</label>
          <Input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="SN-XXXXXX" />
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Photos</div>
            <span className="text-xs text-muted-foreground">{photos} uploaded</span>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setPhotos((p) => p + 1)}>
            <Camera className="h-4 w-4 mr-2" />Upload photo
          </Button>
        </CardContent></Card>

        <SignatureCard signed={signed} onSign={() => setSigned(true)} />

        <Card><CardContent className="p-4 flex items-center gap-2">
          <Checkbox checked={followUp} onCheckedChange={(v) => setFollowUp(!!v)} id="fu" />
          <label htmlFor="fu" className="text-sm">Follow-up required</label>
        </CardContent></Card>

        <Button
          size="lg"
          className="w-full bg-success text-success-foreground hover:bg-success/90"
          onClick={() => alert("Job completed (demo). Equipment records created, warranty saved, first maintenance scheduled for +1 year.")}
        >
          <Check className="h-5 w-5 mr-2" />Complete Job
        </Button>
      </div>
    </div>
  );
}

function SignatureCard({ signed, onSign }: { signed: boolean; onSign: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <Card><CardContent className="p-4 space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer signature</div>
      <div className="relative rounded border-2 border-dashed border-border bg-muted/30">
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full h-40 touch-none"
          onPointerDown={(e) => { drawingRef.current = true; const p = pos(e); const ctx = canvasRef.current!.getContext("2d")!; ctx.beginPath(); ctx.moveTo(p.x, p.y); }}
          onPointerMove={(e) => { if (!drawingRef.current) return; const p = pos(e); const ctx = canvasRef.current!.getContext("2d")!; ctx.lineTo(p.x, p.y); ctx.stroke(); }}
          onPointerUp={() => { drawingRef.current = false; onSign(); }}
        />
        {signed && <div className="absolute top-1 right-2 text-[10px] text-success flex items-center gap-1"><Check className="h-3 w-3" />Signed</div>}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { const c = canvasRef.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); }}>Clear</Button>
        <Button size="sm" variant="secondary" className="flex-1"><PenLine className="h-4 w-4 mr-1" />Save signature</Button>
      </div>
    </CardContent></Card>
  );
}
