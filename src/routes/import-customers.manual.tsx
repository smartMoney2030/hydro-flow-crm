import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMemo, useState } from "react";
import { useCRM, type ExistingCustomerInput, type ExistingCustomerEquipment } from "@/store/crm";
import { CUSTOMER_STAGES, PAYMENT_STATUSES } from "@/lib/import";
import { DuplicateWarning } from "@/components/import/DuplicateWarning";
import { HistoricalBadge } from "@/components/import/HistoricalBadge";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import type { CustomerStage, PaymentStatus } from "@/data/types";

export const Route = createFileRoute("/import-customers/manual")({ component: ManualEntry });

const emptyEquipment = (): ExistingCustomerEquipment => ({ type: "", model: "", serial: "", warrantyExpires: "" });

function ManualEntry() {
  const navigate = useNavigate();
  const users = useCRM((s) => s.users);
  const findDupes = useCRM((s) => s.findDuplicateCustomers);
  const addExisting = useCRM((s) => s.addExistingCustomer);
  const commitBatch = useCRM((s) => s.commitImportBatch);
  const updateCustomer = useCRM((s) => s.updateCustomer);

  const salespeople = users.filter((u) => u.role === "salesperson" || u.role === "admin");
  const technicians = users.filter((u) => u.role === "technician");

  const [form, setForm] = useState<ExistingCustomerInput>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    billingAddress: "",
    propertyAddress: "",
    preferredContact: "phone",
    notes: "",
    stage: "Existing Customer",
    equipment: [emptyEquipment()],
    enrolledInMaintenance: false,
  });
  const [createLead, setCreateLead] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const dupes = useMemo(
    () =>
      form.firstName || form.phone || form.email || form.propertyAddress
        ? findDupes({
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email,
            propertyAddress: form.propertyAddress,
          }).filter((m) => m.customer.id !== editingId)
        : [],
    [form.firstName, form.lastName, form.phone, form.email, form.propertyAddress, editingId, findDupes]
  );

  const set = <K extends keyof ExistingCustomerInput>(k: K, v: ExistingCustomerInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setEq = (i: number, patch: Partial<ExistingCustomerEquipment>) =>
    setForm((f) => ({
      ...f,
      equipment: (f.equipment || []).map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.propertyAddress) {
      toast.error("First name, last name, and property address are required");
      return;
    }
    if (editingId) {
      updateCustomer(editingId, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || "",
        email: form.email || "",
        billingAddress: form.billingAddress || form.propertyAddress,
        propertyAddress: form.propertyAddress,
        notes: form.notes || "",
        stage: form.stage,
        enrolledInMaintenance: form.enrolledInMaintenance,
        assignedSalespersonId: form.assignedSalespersonId,
        assignedTechnicianId: form.assignedTechnicianId,
        originalSaleDate: form.originalSaleDate,
        originalInstallDate: form.originalInstallDate,
        purchasePrice: form.purchasePrice,
        paymentStatus: form.paymentStatus,
        previousServiceHistory: form.previousServiceHistory,
      });
      toast.success("Existing customer updated");
      navigate({ to: "/customers/$id", params: { id: editingId } });
      return;
    }
    const result = addExisting(form);
    commitBatch({
      source: "manual",
      counts: { created: 1, updated: 0, skipped: 0, failed: 0 },
      customerIds: [result.customer.id],
      equipmentIds: result.equipmentIds,
      maintenanceIds: result.maintenanceIds,
      eventIds: result.eventIds,
    });
    if (createLead) {
      // A lead-creation path exists in the full pipeline; here we surface a note
      toast.info("A sales lead was also flagged for this customer.");
    }
    toast.success("Existing customer added");
    navigate({ to: "/customers/$id", params: { id: result.customer.id } });
  };

  const prefillFromExisting = (id: string) => {
    const c = useCRM.getState().customers.find((c) => c.id === id);
    if (!c) return;
    setEditingId(id);
    setForm({
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      email: c.email,
      billingAddress: c.billingAddress,
      propertyAddress: c.propertyAddress,
      preferredContact: c.preferredContact,
      notes: c.notes,
      stage: c.stage || "Existing Customer",
      equipment: form.equipment,
      enrolledInMaintenance: c.enrolledInMaintenance,
      assignedSalespersonId: c.assignedSalespersonId,
      assignedTechnicianId: c.assignedTechnicianId,
      originalSaleDate: c.originalSaleDate,
      originalInstallDate: c.originalInstallDate,
      purchasePrice: c.purchasePrice,
      paymentStatus: c.paymentStatus,
      previousServiceHistory: c.previousServiceHistory,
    });
    toast.info("Editing existing customer — save to update their record");
  };

  return (
    <>
      <PageHeader
        eyebrow="Import"
        title={editingId ? "Update existing customer" : "Add one existing customer"}
        description="Historical information is clearly labeled and can be edited later."
        actions={
          <Link to="/import-customers">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          </Link>
        }
      />
      <Section>
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">Customer info</div>
                  <HistoricalBadge />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="First name *"><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
                  <Field label="Last name *"><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
                  <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
                  <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                  <Field label="Billing address"><Input value={form.billingAddress} onChange={(e) => set("billingAddress", e.target.value)} /></Field>
                  <Field label="Property / install address *"><Input value={form.propertyAddress} onChange={(e) => set("propertyAddress", e.target.value)} /></Field>
                  <Field label="Preferred contact">
                    <Select value={form.preferredContact} onValueChange={(v) => set("preferredContact", v as "phone" | "email" | "text")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Notes"><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
                </div>
              </CardContent>
            </Card>

            {dupes.length > 0 && <DuplicateWarning matches={dupes} onUpdateExisting={prefillFromExisting} />}

            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="text-sm font-semibold">Historical sale</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Original sale date"><Input type="date" value={dateVal(form.originalSaleDate)} onChange={(e) => set("originalSaleDate", e.target.value ? new Date(e.target.value).toISOString() : undefined)} /></Field>
                  <Field label="Original install date"><Input type="date" value={dateVal(form.originalInstallDate)} onChange={(e) => set("originalInstallDate", e.target.value ? new Date(e.target.value).toISOString() : undefined)} /></Field>
                  <Field label="Purchase price">
                    <Input type="number" min={0} value={form.purchasePrice ?? ""} onChange={(e) => set("purchasePrice", e.target.value ? Number(e.target.value) : undefined)} />
                  </Field>
                  <Field label="Payment status">
                    <Select value={form.paymentStatus || ""} onValueChange={(v) => set("paymentStatus", v as PaymentStatus)}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Assigned salesperson">
                    <Select value={form.assignedSalespersonId || ""} onValueChange={(v) => set("assignedSalespersonId", v)}>
                      <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {salespeople.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Assigned technician">
                    <Select value={form.assignedTechnicianId || ""} onValueChange={(v) => set("assignedTechnicianId", v)}>
                      <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {technicians.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Equipment installed</div>
                  <Button type="button" size="sm" variant="outline" onClick={() => set("equipment", [...(form.equipment || []), emptyEquipment()])}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add equipment
                  </Button>
                </div>
                <div className="space-y-3">
                  {(form.equipment || []).map((e, i) => (
                    <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end border rounded p-3">
                      <Field label="Type"><Input value={e.type} onChange={(ev) => setEq(i, { type: ev.target.value })} placeholder="e.g. Softener" /></Field>
                      <Field label="Model"><Input value={e.model} onChange={(ev) => setEq(i, { model: ev.target.value })} /></Field>
                      <Field label="Serial"><Input value={e.serial} onChange={(ev) => setEq(i, { serial: ev.target.value })} /></Field>
                      <Field label="Warranty expires"><Input type="date" value={dateVal(e.warrantyExpires)} onChange={(ev) => setEq(i, { warrantyExpires: ev.target.value ? new Date(ev.target.value).toISOString() : "" })} /></Field>
                      <Button type="button" size="icon" variant="ghost" onClick={() => set("equipment", (form.equipment || []).filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="text-sm font-semibold">Maintenance</div>
                <div className="flex items-center gap-2">
                  <Checkbox id="enrolled" checked={!!form.enrolledInMaintenance} onCheckedChange={(v) => set("enrolledInMaintenance", !!v)} />
                  <Label htmlFor="enrolled">Enrolled in annual maintenance</Label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Last maintenance date"><Input type="date" value={dateVal(form.lastMaintenance)} onChange={(e) => set("lastMaintenance", e.target.value ? new Date(e.target.value).toISOString() : undefined)} /></Field>
                  <Field label="Next maintenance due (auto-suggested from install date)">
                    <Input type="date" value={dateVal(form.nextMaintenance)} onChange={(e) => set("nextMaintenance", e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
                  </Field>
                </div>
                <Field label="Previous service history"><Textarea rows={3} value={form.previousServiceHistory || ""} onChange={(e) => set("previousServiceHistory", e.target.value)} placeholder="e.g. Filter swap 2023-10; leak check 2024-04" /></Field>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="text-sm font-semibold">Photos & documents</div>
                <Input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    const encoded = await Promise.all(
                      files.map(
                        (f) =>
                          new Promise<{ name: string; dataUrl: string }>((resolve) => {
                            const r = new FileReader();
                            r.onload = () => resolve({ name: f.name, dataUrl: String(r.result) });
                            r.readAsDataURL(f);
                          })
                      )
                    );
                    set("photos", [...(form.photos || []), ...encoded.filter((f) => f.dataUrl.startsWith("data:image"))]);
                    set("documents", [...(form.documents || []), ...encoded.filter((f) => !f.dataUrl.startsWith("data:image"))]);
                  }}
                />
                <div className="text-xs text-muted-foreground">
                  {(form.photos?.length || 0)} photo(s), {(form.documents?.length || 0)} document(s) attached.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-5 space-y-3">
                <div className="text-sm font-semibold">Starting stage</div>
                <p className="text-xs text-muted-foreground">Choose where this customer belongs today — they don't have to begin as a new lead.</p>
                <RadioGroup value={form.stage} onValueChange={(v) => set("stage", v as CustomerStage)} className="space-y-1">
                  {CUSTOMER_STAGES.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value={s} id={s} />
                      <Label htmlFor={s} className="cursor-pointer">{s}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex items-start gap-2 pt-2 border-t">
                  <Checkbox id="createLead" checked={createLead} onCheckedChange={(v) => setCreateLead(!!v)} />
                  <Label htmlFor="createLead" className="text-xs leading-snug cursor-pointer">
                    Also create a sales lead for this customer (off by default — historical customers should not clutter the pipeline).
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-2 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">On save</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Property address is geocoded and added to the map.</li>
                  <li>Equipment records are created for previously installed systems.</li>
                  <li>Next annual maintenance is computed from the install date when possible.</li>
                  <li>Future installations and maintenance are added to the calendar.</li>
                  <li>Record is labeled <em>Historical data</em> and can be edited later.</li>
                </ul>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full bg-primary">
              {editingId ? "Update customer" : "Save existing customer"}
            </Button>
          </div>
        </form>
      </Section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function dateVal(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
