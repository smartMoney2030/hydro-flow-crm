import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon = "Activity",
  tone = "default",
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  to?: string;
}) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] || Icons.Activity;
  const toneClasses = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-destructive/15 text-destructive",
    info: "bg-info/15 text-info",
  }[tone];

  const inner: ReactNode = (
    <CardContent className="p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl lg:text-3xl font-bold text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0", toneClasses)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </CardContent>
  );

  const card = <Card className={cn("shadow-card hover:shadow-wave transition-shadow", to && "cursor-pointer")}>{inner}</Card>;
  return to ? <Link to={to}>{card}</Link> : card;
}
