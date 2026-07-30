import { useEffect, useState } from "react";
import type { Customer, CustomerStage, PaymentStatus } from "@/data/types";
import { CUSTOMER_STAGES, PAYMENT_STATUSES } from "@/lib/import";
import { useCRM } from "@/store/crm";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CustomerForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  billingAddress: string;
  propertyAddress: string;
  preferredContact: Customer["preferredContact"];
  stage: CustomerStage;
  assignedSalespersonId: string;
  assignedTechnicianId: string;
  originalSaleDate: string;
  originalInstallDate: string;
  purchasePrice: string;
  paymentStatus: string;
  enrolledInMaintenance: boolean;
  notes: string;
  previousServiceHistory: string;
}

const toForm = (customer: Customer): CustomerForm => ({
  firstName: customer.firstName,
  lastName: customer.lastName,
  phone: customer.phone,
  email: customer.email,
  billingAddress: customer.billingAddress,
  propertyAddress: customer.propertyAddress,
  preferredContact: customer.preferredContact,
  stage: customer.stage || "Existing Customer",
  assignedSalespersonId: customer.assignedSalespersonId || "unassigned",
  assignedTechnicianId: customer.assignedTechnicianId || "unassigned",
  originalSaleDate: customer.originalSaleDate?.slice(0, 10) || "",
  originalInstallDate: customer.originalInstallDate?.slice(0, 10) || "",
  purchasePrice: customer.purchasePrice?.toString() || "",
  paymentStatus: customer.paymentStatus || "unspecified",
  enrolledInMaintenance: !!customer.enrolledInMaintenance,
  notes: customer.notes,
  previousServiceHistory: customer.previousServiceHistory || "",
});

export function EditCustomerDialog({ customer, open, onOpenChange }: EditCustomerDialogProps) {
  const users = useCRM((s) => s.users);
  const updateCustomer = useCRM((s) => s.updateCustomer);
  const [form, setForm] = useState<CustomerForm>(() => toForm(customer));

  useEffect(() => {
    if (open) setForm(toForm(customer));
  }, [customer, open]);

  const set = <K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.propertyAddress.trim()) {
      toast.error("First name, last name, and property address are required");
      return;
    }

    const purchasePrice = form.purchasePrice ? Number(form.purchasePrice) : undefined;
    if (purchasePrice !== undefined && !Number.isFinite(purchasePrice)) {
      toast.error("Purchase price must be a number");
      return;
    }

    updateCustomer(customer.id, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      billingAddress: form.billingAddress.trim() || form.propertyAddress.trim(),
      propertyAddress: form.propertyAddress.trim(),
      preferredContact: form.preferredContact,
      stage: form.stage,
      assignedSalespersonId:
        form.assignedSalespersonId === "unassigned" ? undefined : form.assignedSalespersonId,
      assignedTechnicianId:
        form.assignedTechnicianId === "unassigned" ? undefined : form.assignedTechnicianId,
      originalSaleDate: form.originalSaleDate || undefined,
      originalInstallDate: form.originalInstallDate || undefined,
      purchasePrice,
      paymentStatus:
        form.paymentStatus === "unspecified" ? undefined : (form.paymentStatus as PaymentStatus),
      enrolledInMaintenance: form.enrolledInMaintenance,
      notes: form.notes.trim(),
      previousServiceHistory: form.previousServiceHistory.trim() || undefined,
    });
    toast.success("Customer updated");
    onOpenChange(false);
  };

  const salespeople = users.filter((user) => ["salesperson", "admin"].includes(user.role));
  const technicians = users.filter((user) => user.role === "technician");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
          <DialogDescription>
            Complete contact details, imported history, assignments, and notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <section className="grid gap-3">
            <h3 className="text-sm font-semibold">Customer details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name *">
                <Input
                  value={form.firstName}
                  onChange={(event) => set("firstName", event.target.value)}
                />
              </Field>
              <Field label="Last name *">
                <Input
                  value={form.lastName}
                  onChange={(event) => set("lastName", event.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(event) => set("phone", event.target.value)} />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => set("email", event.target.value)}
                />
              </Field>
              <Field label="Billing address">
                <Input
                  value={form.billingAddress}
                  onChange={(event) => set("billingAddress", event.target.value)}
                />
              </Field>
              <Field label="Property / install address *">
                <Input
                  value={form.propertyAddress}
                  onChange={(event) => set("propertyAddress", event.target.value)}
                />
              </Field>
              <Field label="Preferred contact">
                <Select
                  value={form.preferredContact}
                  onValueChange={(value) =>
                    set("preferredContact", value as Customer["preferredContact"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Customer stage">
                <Select
                  value={form.stage}
                  onValueChange={(value) => set("stage", value as CustomerStage)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          <section className="grid gap-3 border-t pt-5">
            <h3 className="text-sm font-semibold">Imported history</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Original sale date">
                <Input
                  type="date"
                  value={form.originalSaleDate}
                  onChange={(event) => set("originalSaleDate", event.target.value)}
                />
              </Field>
              <Field label="Original install date">
                <Input
                  type="date"
                  value={form.originalInstallDate}
                  onChange={(event) => set("originalInstallDate", event.target.value)}
                />
              </Field>
              <Field label="Purchase price">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.purchasePrice}
                  onChange={(event) => set("purchasePrice", event.target.value)}
                />
              </Field>
              <Field label="Payment status">
                <Select
                  value={form.paymentStatus}
                  onValueChange={(value) => set("paymentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unspecified">Not specified</SelectItem>
                    {PAYMENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Assigned salesperson">
                <Select
                  value={form.assignedSalespersonId}
                  onValueChange={(value) => set("assignedSalespersonId", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {salespeople.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Assigned technician">
                <Select
                  value={form.assignedTechnicianId}
                  onValueChange={(value) => set("assignedTechnicianId", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {technicians.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.enrolledInMaintenance}
                onCheckedChange={(checked) => set("enrolledInMaintenance", checked === true)}
              />
              Enrolled in annual maintenance
            </label>
          </section>

          <section className="grid gap-3 border-t pt-5">
            <h3 className="text-sm font-semibold">Notes and service history</h3>
            <Field label="Customer notes">
              <Textarea
                value={form.notes}
                onChange={(event) => set("notes", event.target.value)}
                rows={4}
              />
            </Field>
            <Field label="Previous service history">
              <Textarea
                value={form.previousServiceHistory}
                onChange={(event) => set("previousServiceHistory", event.target.value)}
                rows={5}
              />
            </Field>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
