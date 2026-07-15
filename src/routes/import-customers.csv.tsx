import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import Papa from "papaparse";
import { useCRM, type ExistingCustomerInput } from "@/store/crm";
import {
  CUSTOMER_STAGES,
  IMPORT_FIELDS,
  csvTemplate,
  guessMapping,
  parseBool,
  toISODateOrUndef,
  type ImportFieldKey,
} from "@/lib/import";
import { toast } from "sonner";
import { ArrowLeft, Download, Upload, Undo2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import type { CustomerStage, PaymentStatus } from "@/data/types";

export const Route = createFileRoute("/import-customers/csv")({ component: CsvWizard });

type Row = Record<string, string>;
type Resolution = "create" | "update" | "skip";
type PreviewRow = {
  row: Row;
  input: ExistingCustomerInput;
  missing: string[];
  duplicateId?: string;
  duplicateReasons?: string[];
  resolution: Resolution;
};

function CsvWizard() {
  const navigate = useNavigate();
  const findDupes = useCRM((s) => s.findDuplicateCustomers);
  const addExisting = useCRM((s) => s.addExistingCustomer);
  const updateCustomer = useCRM((s) => s.updateCustomer);
  const commitBatch = useCRM((s) => s.commitImportBatch);
  const users = useCRM((s) => s.users);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [filename, setFilename] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, ImportFieldKey | "">>({});
  const [previews, setPreviews] = useState<PreviewRow[]>([]);
  const [report, setReport] = useState<{ created: number; updated: number; skipped: number; failed: number; batchId?: string } | null>(null);

  const download = () => {
    const blob = new Blob([csvTemplate()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "existing-customers-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    setFilename(file.name);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const data = res.data.filter((r) => Object.values(r).some((v) => String(v).trim()));
        const hs = res.meta.fields || [];
        setRows(data);
        setHeaders(hs);
        setMapping(guessMapping(hs));
        setStep(2);
      },
      error: () => toast.error("Could not parse CSV file"),
    });
  };

  const buildPreviews = () => {
    const invMap: Partial<Record<ImportFieldKey, string>> = {};
    for (const [h, k] of Object.entries(mapping)) if (k) invMap[k] = h;

    const pickName = (val: string) => users.find((u) => u.name.toLowerCase() === (val || "").toLowerCase())?.id;
    const list: PreviewRow[] = rows.map((r) => {
      const get = (k: ImportFieldKey) => (invMap[k] ? String(r[invMap[k]!] ?? "").trim() : "");
      const rawStage = get("stage");
      const stage = (CUSTOMER_STAGES.find((s) => s.toLowerCase() === rawStage.toLowerCase()) || "Existing Customer") as CustomerStage;
      const input: ExistingCustomerInput = {
        firstName: get("firstName"),
        lastName: get("lastName"),
        phone: get("phone"),
        email: get("email"),
        billingAddress: get("billingAddress"),
        propertyAddress: get("propertyAddress"),
        notes: get("notes"),
        stage,
        originalSaleDate: toISODateOrUndef(get("originalSaleDate")),
        originalInstallDate: toISODateOrUndef(get("originalInstallDate")),
        purchasePrice: get("purchasePrice") ? Number(get("purchasePrice")) : undefined,
        paymentStatus: (get("paymentStatus") as PaymentStatus) || undefined,
        assignedSalespersonId: pickName(get("salespersonName")),
        assignedTechnicianId: pickName(get("technicianName")),
        enrolledInMaintenance: parseBool(get("enrolledInMaintenance")),
        lastMaintenance: toISODateOrUndef(get("lastMaintenance")),
        nextMaintenance: toISODateOrUndef(get("nextMaintenance")),
        previousServiceHistory: get("previousServiceHistory"),
        equipment: get("equipmentType") || get("equipmentModel") || get("equipmentSerial")
          ? [{ type: get("equipmentType"), model: get("equipmentModel"), serial: get("equipmentSerial"), warrantyExpires: toISODateOrUndef(get("warrantyExpires")) }]
          : [],
      };

      const missing: string[] = [];
      for (const f of IMPORT_FIELDS) {
        if (f.required && !(input as unknown as Record<string, unknown>)[f.key]) missing.push(f.label);
      }

      const dupes = findDupes({
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email,
        propertyAddress: input.propertyAddress,
      });
      const dup = dupes[0];

      return {
        row: r,
        input,
        missing,
        duplicateId: dup?.customer.id,
        duplicateReasons: dup?.reasons,
        resolution: missing.length ? "skip" : dup ? "skip" : "create",
      };
    });
    setPreviews(list);
    setStep(3);
  };

  const setResolution = (i: number, res: Resolution) =>
    setPreviews((p) => p.map((row, idx) => (idx === i ? { ...row, resolution: res } : row)));

  const bulkResolve = (res: Resolution) =>
    setPreviews((p) => p.map((row) => (row.duplicateId ? { ...row, resolution: res } : row)));

  const runImport = () => {
    let created = 0, updated = 0, skipped = 0, failed = 0;
    const customerIds: string[] = [];
    const equipmentIds: string[] = [];
    const maintenanceIds: string[] = [];
    const eventIds: string[] = [];

    for (const p of previews) {
      try {
        if (p.missing.length || p.resolution === "skip") {
          if (p.missing.length && p.resolution !== "skip") failed++;
          else skipped++;
          continue;
        }
        if (p.resolution === "update" && p.duplicateId) {
          updateCustomer(p.duplicateId, {
            phone: p.input.phone || undefined,
            email: p.input.email || undefined,
            billingAddress: p.input.billingAddress || undefined,
            notes: p.input.notes || undefined,
            stage: p.input.stage,
            originalSaleDate: p.input.originalSaleDate,
            originalInstallDate: p.input.originalInstallDate,
            purchasePrice: p.input.purchasePrice,
            paymentStatus: p.input.paymentStatus,
            enrolledInMaintenance: p.input.enrolledInMaintenance,
            previousServiceHistory: p.input.previousServiceHistory,
            isHistorical: true,
          });
          updated++;
        } else {
          const r = addExisting(p.input);
          customerIds.push(r.customer.id);
          equipmentIds.push(...r.equipmentIds);
          maintenanceIds.push(...r.maintenanceIds);
          eventIds.push(...r.eventIds);
          created++;
        }
      } catch {
        failed++;
      }
    }
    const batch = commitBatch({
      source: "csv",
      filename,
      counts: { created, updated, skipped, failed },
      customerIds,
      equipmentIds,
      maintenanceIds,
      eventIds,
    });
    setReport({ created, updated, skipped, failed, batchId: batch.id });
    setStep(4);
    toast.success(`Imported ${created} customer${created === 1 ? "" : "s"}`);
  };

  const dupeCount = useMemo(() => previews.filter((p) => p.duplicateId).length, [previews]);

  return (
    <>
      <PageHeader
        eyebrow="Import"
        title="CSV / Spreadsheet import"
        description="Upload, map columns, resolve duplicates, then review your import report."
        actions={
          <Link to="/import-customers">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          </Link>
        }
      />
      <Section className="space-y-4">
        <StepIndicator step={step} />

        {step === 1 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm">Start with our template to make column mapping automatic, or upload your own spreadsheet.</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={download}><Download className="h-4 w-4 mr-1" /> Download CSV template</Button>
              </div>
              <label className="mt-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 cursor-pointer hover:bg-muted/50">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <div className="text-sm font-medium">Click to upload a CSV file</div>
                <div className="text-xs text-muted-foreground">or drag and drop</div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm">
                <span className="font-medium">{rows.length}</span> row{rows.length === 1 ? "" : "s"} detected in <em>{filename}</em>. Match each spreadsheet column to a CRM field.
              </div>
              <div className="border rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs">
                    <tr>
                      <th className="text-left p-2">Spreadsheet column</th>
                      <th className="text-left p-2">Sample value</th>
                      <th className="text-left p-2">CRM field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((h) => (
                      <tr key={h} className="border-t">
                        <td className="p-2 font-medium">{h}</td>
                        <td className="p-2 text-muted-foreground truncate max-w-[220px]">{rows[0]?.[h] || <span className="italic">empty</span>}</td>
                        <td className="p-2">
                          <Select value={mapping[h] || "__none"} onValueChange={(v) => setMapping({ ...mapping, [h]: v === "__none" ? "" : (v as ImportFieldKey) })}>
                            <SelectTrigger className="h-8"><SelectValue placeholder="Ignore" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">— Ignore —</SelectItem>
                              {IMPORT_FIELDS.map((f) => (
                                <SelectItem key={f.key} value={f.key}>{f.label}{f.required ? " *" : ""}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={buildPreviews}>Preview →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">
                  <span className="font-medium">{previews.length}</span> rows · {previews.filter((p) => !p.missing.length && !p.duplicateId).length} valid · {dupeCount} duplicate · {previews.filter((p) => p.missing.length).length} with missing data
                </div>
                {dupeCount > 0 && (
                  <div className="flex gap-2 text-xs">
                    <span className="text-muted-foreground self-center">Duplicates:</span>
                    <Button size="sm" variant="outline" onClick={() => bulkResolve("skip")}>Skip all</Button>
                    <Button size="sm" variant="outline" onClick={() => bulkResolve("update")}>Update all</Button>
                    <Button size="sm" variant="outline" onClick={() => bulkResolve("create")}>Create all</Button>
                  </div>
                )}
              </div>
              <div className="border rounded overflow-x-auto max-h-[520px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs sticky top-0">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Contact</th>
                      <th className="text-left p-2">Property address</th>
                      <th className="text-left p-2">Stage</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previews.map((p, i) => (
                      <tr key={i} className="border-t align-top">
                        <td className="p-2">{p.input.firstName} {p.input.lastName}</td>
                        <td className="p-2 text-xs text-muted-foreground">{p.input.phone}<br />{p.input.email}</td>
                        <td className="p-2 text-xs">{p.input.propertyAddress}</td>
                        <td className="p-2 text-xs">{p.input.stage}</td>
                        <td className="p-2 text-xs">
                          {p.missing.length ? (
                            <Badge variant="destructive">Missing: {p.missing.join(", ")}</Badge>
                          ) : p.duplicateId ? (
                            <Badge className="bg-warning/20 text-warning-foreground border border-warning/40">Duplicate · {p.duplicateReasons?.join(", ")}</Badge>
                          ) : (
                            <Badge className="bg-primary/10 text-primary border border-primary/30">Valid</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          <Select value={p.resolution} onValueChange={(v) => setResolution(i, v as Resolution)} disabled={!!p.missing.length}>
                            <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="create">Create new</SelectItem>
                              <SelectItem value="update" disabled={!p.duplicateId}>Update existing</SelectItem>
                              <SelectItem value="skip">Skip</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={runImport}>Import {previews.filter((p) => p.resolution !== "skip" && !p.missing.length).length} rows</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && report && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Created" n={report.created} tone="ok" />
                <Stat label="Updated" n={report.updated} tone="ok" />
                <Stat label="Skipped" n={report.skipped} tone="warn" />
                <Stat label="Failed" n={report.failed} tone="bad" />
              </div>
              <div className="text-sm text-muted-foreground">
                Imported customers are tagged as <em>Historical data</em>. Property addresses were geocoded and pinned on the map; future installations and maintenance were added to the calendar.
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/customers"><Button variant="outline">View customers</Button></Link>
                <Link to="/map"><Button variant="outline">Open map</Button></Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (report.batchId && useCRM.getState().reverseImportBatch(report.batchId)) {
                      toast.success("Import reversed");
                      navigate({ to: "/import-customers" });
                    } else {
                      toast.error("Only admins can reverse an import");
                    }
                  }}
                >
                  <Undo2 className="h-4 w-4 mr-1" /> Undo this import (admin)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </Section>
    </>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  const labels = ["Upload", "Map columns", "Preview & dedupe", "Report"];
  return (
    <div className="flex items-center gap-2 text-xs">
      {labels.map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4;
        const active = n === step;
        const done = n < step;
        return (
          <div key={l} className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-semibold ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              {n}
            </div>
            <div className={active ? "font-medium" : "text-muted-foreground"}>{l}</div>
            {i < labels.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, n, tone }: { label: string; n: number; tone: "ok" | "warn" | "bad" }) {
  const Icon = tone === "ok" ? CheckCircle2 : tone === "warn" ? AlertCircle : XCircle;
  const color = tone === "ok" ? "text-primary" : tone === "warn" ? "text-warning" : "text-destructive";
  return (
    <div className="border rounded p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="text-2xl font-bold mt-1">{n}</div>
    </div>
  );
}
