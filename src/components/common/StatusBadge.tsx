import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  "New Lead": "bg-info/15 text-info border-info/20",
  "Contact Attempted": "bg-muted text-muted-foreground border-border",
  "Sales Call Scheduled": "bg-accent/20 text-primary border-accent/30",
  Qualified: "bg-primary/15 text-primary border-primary/20",
  "Quote Sent": "bg-warning/15 text-warning-foreground border-warning/30",
  "Follow-Up": "bg-warning/15 text-warning-foreground border-warning/30",
  "Sale Won": "bg-success/15 text-success border-success/30",
  "Sale Lost": "bg-destructive/15 text-destructive border-destructive/30",

  "Payment Pending": "bg-warning/15 text-warning-foreground border-warning/30",
  "Deposit Collected": "bg-info/15 text-info border-info/30",
  "Supplies Need Ordering": "bg-warning/15 text-warning-foreground border-warning/30",
  "Supplies Ordered": "bg-info/15 text-info border-info/30",
  "Awaiting Delivery": "bg-info/15 text-info border-info/30",
  "Ready to Schedule": "bg-accent/25 text-primary border-accent/30",
  "Installation Scheduled": "bg-accent/25 text-primary border-accent/30",
  "Installation in Progress": "bg-primary/15 text-primary border-primary/20",
  "Installation Completed": "bg-success/15 text-success border-success/30",
  "Follow-Up Required": "bg-warning/15 text-warning-foreground border-warning/30",
  "Job Closed": "bg-muted text-muted-foreground border-border",

  "Active Maintenance Customer": "bg-success/15 text-success border-success/30",
  "Due Within 60 Days": "bg-info/15 text-info border-info/30",
  "Due Within 30 Days": "bg-warning/15 text-warning-foreground border-warning/30",
  "Due Within 7 Days": "bg-warning/25 text-warning-foreground border-warning/40",
  "Maintenance Scheduled": "bg-accent/25 text-primary border-accent/30",
  "Maintenance Completed": "bg-success/15 text-success border-success/30",
  "Maintenance Overdue": "bg-destructive/15 text-destructive border-destructive/30",
  "Maintenance Paused": "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = tones[status] || "bg-muted text-muted-foreground border-border";
  return <Badge variant="outline" className={cn("font-medium", tone, className)}>{status}</Badge>;
}
