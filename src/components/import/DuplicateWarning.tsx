import type { DuplicateMatch } from "@/lib/import";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function DuplicateWarning({
  matches,
  onUpdateExisting,
}: {
  matches: DuplicateMatch[];
  onUpdateExisting?: (customerId: string) => void;
}) {
  if (!matches.length) return null;
  return (
    <Alert className="border-warning/40 bg-warning/5">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle>Possible duplicate customer{matches.length > 1 ? "s" : ""} found</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          {matches.slice(0, 4).map((m) => (
            <div key={m.customer.id} className="flex flex-wrap items-center justify-between gap-2 rounded border bg-background p-2">
              <div className="min-w-0">
                <div className="font-medium text-sm">
                  {m.customer.firstName} {m.customer.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {m.customer.phone} · {m.customer.email}
                </div>
                <div className="text-xs text-muted-foreground truncate">{m.customer.propertyAddress}</div>
                <div className="text-[11px] text-warning-foreground mt-1">Match: {m.reasons.join(", ")}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to="/customers/$id" params={{ id: m.customer.id }}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
                {onUpdateExisting && (
                  <Button size="sm" onClick={() => onUpdateExisting(m.customer.id)}>
                    Update existing
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
