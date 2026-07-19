import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, FileText, CreditCard, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/client-hub")({ component: ClientHubPage });

function ClientHubPage() {
  return (
    <>
      <PageHeader eyebrow="Portal" title="Client Hub Preview" description="What your customers see when they log in to their portal" actions={<Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText("https://mywaterpeople.com/portal"); toast.success("Portal link copied"); }}>Copy portal link</Button>} />
      <Section>
        <div className="max-w-3xl mx-auto border rounded-2xl overflow-hidden shadow-sm bg-background">
          <div className="bg-primary text-primary-foreground px-6 py-5">
            <div className="text-xs opacity-80">Welcome back</div>
            <div className="text-xl font-semibold">Ana Ruiz</div>
            <div className="text-xs opacity-80 mt-1">142 Elm St, San Antonio TX</div>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <PortalCard icon={<Calendar className="h-4 w-4" />} title="Upcoming appointment" body="Softener install · Tue Jul 22, 9–11 AM" cta="Reschedule" />
            <PortalCard icon={<FileText className="h-4 w-4" />} title="Quote Q-1042" body="Standard $3,200 or Premium $4,800" cta="Approve" highlight />
            <PortalCard icon={<CreditCard className="h-4 w-4" />} title="Open invoice" body="INV-2040 · $3,200 due" cta="Pay now" />
            <PortalCard icon={<CheckCircle2 className="h-4 w-4" />} title="Service history" body="3 past visits · last on May 12" cta="View history" />
            <PortalCard icon={<Bell className="h-4 w-4" />} title="Notifications" body="You'll get texts when your tech is on the way." cta="Manage" />
          </div>
          <div className="px-6 py-4 border-t text-xs text-muted-foreground bg-muted/40">Portal is 24/7. Customers can approve quotes, view records, pay invoices, and reschedule.</div>
        </div>
      </Section>
    </>
  );
}

function PortalCard({ icon, title, body, cta, highlight }: { icon: React.ReactNode; title: string; body: string; cta: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-primary" : ""}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{title}{highlight && <Badge className="ml-auto">Action needed</Badge>}</div>
        <div className="text-sm">{body}</div>
        <Button size="sm" variant={highlight ? "default" : "outline"} onClick={() => toast.success(`${cta} clicked`)}>{cta}</Button>
      </CardContent>
    </Card>
  );
}
