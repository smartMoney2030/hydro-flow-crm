import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/store/crm";
import { UserPlus, FileSpreadsheet, Undo2 } from "lucide-react";
import { dateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/import-customers")({ component: ImportLanding });


function ImportLanding() {
  const batches = useCRM((s) => s.importBatches);
  const role = useCRM((s) => s.role);
  const reverse = useCRM((s) => s.reverseImportBatch);
  const navigate = useNavigate();


  return (
    <>
      <PageHeader
        eyebrow="Onboarding"
        title="Import Existing Customers"
        description="Add customers who existed before the CRM. Historical data will be labeled and can be edited later."
      />
      <Section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/import-customers/manual">
            <Card className="shadow-sm hover:shadow-card transition-shadow h-full">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div className="font-semibold text-lg">Add one existing customer</div>
                <p className="text-sm text-muted-foreground">
                  Enter one customer with their equipment, purchase, and maintenance history. Choose their current
                  stage — they don't need to start as a new lead.
                </p>
                <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate({ to: "/import-customers/manual" }); }}>Start manual entry →</Button>
              </CardContent>
            </Card>
          </Link>
          <Link to="/import-customers/csv">
            <Card className="shadow-sm hover:shadow-card transition-shadow h-full">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-accent/20 grid place-items-center">
                  <FileSpreadsheet className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="font-semibold text-lg">Import from CSV or spreadsheet</div>
                <p className="text-sm text-muted-foreground">
                  Upload a spreadsheet, map columns to CRM fields, preview and resolve duplicates, then import
                  in one batch. Admins can undo the batch afterward.
                </p>
                <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate({ to: "/import-customers/csv" }); }}>Open CSV wizard →</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">Recent import batches</div>
          <Card>
            <CardContent className="p-0">
              {batches.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No imports yet.</div>
              ) : (
                <div className="divide-y">
                  {batches.map((b) => (
                    <div key={b.id} className="p-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          {b.source === "csv" ? `CSV · ${b.filename || "upload"}` : "Manual entry"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dateTime(b.createdAt)} · {b.counts.created} created · {b.counts.updated} updated ·{" "}
                          {b.counts.skipped} skipped · {b.counts.failed} failed
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.reversedAt ? `Reversed ${dateTime(b.reversedAt)}` : `${b.customerIds.length} customers`}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={role !== "admin" || !!b.reversedAt}
                        onClick={() => {
                          if (reverse(b.id)) toast.success("Import batch reversed");
                          else toast.error("Only admins can reverse an import");
                        }}
                        title={role !== "admin" ? "Admin only" : "Reverse this import"}
                      >
                        <Undo2 className="h-3.5 w-3.5 mr-1" />
                        Undo
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
