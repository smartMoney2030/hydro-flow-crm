import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function HistoricalBadge({ className = "" }: { className?: string }) {
  return (
    <Badge variant="outline" className={`bg-warning/10 text-warning-foreground border-warning/40 gap-1 ${className}`}>
      <Clock className="h-3 w-3" /> Historical data
    </Badge>
  );
}
