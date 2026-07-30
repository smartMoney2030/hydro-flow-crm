import { useEffect, useState } from "react";
import type {
  Customer,
  Equipment,
  Installation,
  Job,
  JobStatus,
  MaintenanceStatus,
  MaintenanceVisit,
  PaymentStatus,
  Task,
} from "@/data/types";
import { PAYMENT_STATUSES } from "@/lib/import";
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

export type RelatedRecordType = "job" | "installation" | "maintenance" | "task";

interface RelatedRecordDialogProps {
  customer: Customer;
  type: RelatedRecordType;
  recordId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RelatedForm {
  invoiceNumber: string;
  systemType: string;
  saleDate: string;
  totalPrice: string;
  depositRequired: string;
  depositCollected: string;
  jobStatus: JobStatus;
  paymentStatus: PaymentStatus;
  salespersonId: string;
  notes: string;
  jobId: string;
  address: string;
  startAt: string;
  endAt: string;
  technicianId: string;
  installStatus: Installation["status"];
  equipment: string;
  instructions: string;
  technicianNotes: string;
  signatureCaptured: boolean;
  followUpRequired: boolean;
  installationEquipmentId: string;
  equipmentId: string;
  dueDate: string;
  scheduledAt: string;
  maintenanceStatus: MaintenanceStatus;
  workPerformed: string;
  partsUsed: string;
  completedAt: string;
  nextDueDate: string;
  title: string;
  description: string;
  dueAt: string;
  assigneeId: string;
  priority: Task["priority"];
  done: boolean;
}

const JOB_STATUSES: JobStatus[] = [
  "Payment Pending",
  "Deposit Collected",
  "Supplies Need Ordering",
  "Supplies Ordered",
  "Awaiting Delivery",
  "Ready to Schedule",
  "Installation Scheduled",
  "Installation in Progress",
  "Installation Completed",
  "Follow-Up Required",
  "Job Closed",
];

const MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  "Active Maintenance Customer",
  "Due Within 60 Days",
  "Due Within 30 Days",
  "Due Within 7 Days",
  "Maintenance Scheduled",
  "Maintenance Completed",
  "Maintenance Overdue",
  "Maintenance Paused",
];

const INSTALLATION_STATUSES: Installation["status"][] = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Rescheduled",
  "Cancelled",
];

const dateValue = (value?: string) => (value ? value.slice(0, 10) : "");
const dateTimeValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(0, 16) : date.toISOString().slice(0, 16);
};
const today = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => new Date().toISOString().slice(0, 16);
const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 16);

const blankForm = (customer: Customer, currentUserId: string): RelatedForm => ({
  invoiceNumber: "",
  systemType: "",
  saleDate: customer.originalSaleDate?.slice(0, 10) || today(),
  totalPrice: customer.purchasePrice?.toString() || "",
  depositRequired: "",
  depositCollected: "",
  jobStatus: "Payment Pending",
  paymentStatus: customer.paymentStatus || "Unpaid",
  salespersonId: customer.assignedSalespersonId || currentUserId,
  notes: "",
  jobId: "none",
  address: customer.propertyAddress,
  startAt: customer.originalInstallDate
    ? `${customer.originalInstallDate.slice(0, 10)}T09:00`
    : nowLocal(),
  endAt: customer.originalInstallDate
    ? `${customer.originalInstallDate.slice(0, 10)}T12:00`
    : hoursFromNow(3),
  technicianId: customer.assignedTechnicianId || "unassigned",
  installStatus: "Scheduled",
  equipment: "",
  instructions: "",
  technicianNotes: "",
  signatureCaptured: false,
  followUpRequired: false,
  installationEquipmentId: "none",
  equipmentId: "none",
  dueDate: today(),
  scheduledAt: "",
  maintenanceStatus: "Due Within 30 Days",
  workPerformed: "",
  partsUsed: "",
  completedAt: "",
  nextDueDate: "",
  title: "",
  description: "",
  dueAt: hoursFromNow(24),
  assigneeId: customer.assignedTechnicianId || currentUserId,
  priority: "med",
  done: false,
});

const numberValue = (value: string) => (value.trim() ? Number(value) : 0);
const listValue = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const equipmentLabel = (equipment: Pick<Equipment, "type" | "model" | "serial">) =>
  `${equipment.type} · ${equipment.model}${
    equipment.serial && equipment.serial !== "—" ? ` · SN ${equipment.serial}` : ""
  }`;

export function RelatedRecordDialog({
  customer,
  type,
  recordId,
  open,
  onOpenChange,
}: RelatedRecordDialogProps) {
  const s = useCRM();
  const [form, setForm] = useState<RelatedForm>(() => blankForm(customer, s.currentUserId));

  const job = type === "job" ? s.jobs.find((item) => item.id === recordId) : undefined;
  const installation =
    type === "installation" ? s.installations.find((item) => item.id === recordId) : undefined;
  const maintenance =
    type === "maintenance" ? s.maintenance.find((item) => item.id === recordId) : undefined;
  const task = type === "task" ? s.tasks.find((item) => item.id === recordId) : undefined;

  useEffect(() => {
    if (!open) return;
    const next = blankForm(customer, s.currentUserId);
    if (job) {
      Object.assign(next, {
        invoiceNumber: job.invoiceNumber,
        systemType: job.systemType,
        saleDate: dateValue(job.saleDate),
        totalPrice: job.totalPrice.toString(),
        depositRequired: job.depositRequired.toString(),
        depositCollected: job.depositCollected.toString(),
        jobStatus: job.status,
        paymentStatus: job.paymentStatus,
        salespersonId: job.salespersonId,
        notes: job.notes,
      });
    }
    if (installation) {
      const relatedEquipment = s.equipment.filter((item) => item.customerId === customer.id);
      const linkedEquipment = relatedEquipment.find((item) =>
        installation.equipment.some(
          (name) => name === equipmentLabel(item) || name === `${item.type} · ${item.model}`,
        ),
      );
      Object.assign(next, {
        jobId: installation.jobId || "none",
        address: installation.address,
        startAt: dateTimeValue(installation.startAt),
        endAt: dateTimeValue(installation.endAt),
        technicianId: installation.technicianId || "unassigned",
        installStatus: installation.status,
        equipment: installation.equipment.join(", "),
        instructions: installation.instructions,
        technicianNotes: installation.technicianNotes,
        signatureCaptured: installation.signatureCaptured,
        followUpRequired: installation.followUpRequired,
        installationEquipmentId: linkedEquipment
          ? linkedEquipment.id
          : installation.equipment.length
            ? "recorded"
            : "none",
      });
    }
    if (maintenance) {
      Object.assign(next, {
        equipmentId: maintenance.equipmentId || "none",
        dueDate: dateValue(maintenance.dueDate),
        scheduledAt: dateTimeValue(maintenance.scheduledAt),
        technicianId: maintenance.technicianId || "unassigned",
        maintenanceStatus: maintenance.status,
        workPerformed: maintenance.workPerformed || "",
        partsUsed: (maintenance.partsUsed || []).join(", "),
        paymentStatus: maintenance.paymentStatus,
        notes: maintenance.notes,
        completedAt: dateTimeValue(maintenance.completedAt),
        nextDueDate: dateValue(maintenance.nextDueDate),
      });
    }
    if (task) {
      Object.assign(next, {
        title: task.title,
        description: task.description || "",
        dueAt: dateTimeValue(task.dueAt),
        assigneeId: task.assigneeId,
        priority: task.priority,
        done: task.done,
      });
    }
    setForm(next);
  }, [customer, installation, job, maintenance, open, s.currentUserId, s.equipment, task]);

  const set = <K extends keyof RelatedForm>(key: K, value: RelatedForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const saveJob = () => {
    if (!form.invoiceNumber.trim() || !form.systemType.trim() || !form.saleDate) {
      toast.error("Invoice number, system type, and sale date are required");
      return false;
    }
    const values = [form.totalPrice, form.depositRequired, form.depositCollected]
      .filter(Boolean)
      .map(Number);
    if (values.some((value) => !Number.isFinite(value))) {
      toast.error("Job amounts must be valid numbers");
      return false;
    }
    const input: Omit<Job, "id"> = {
      customerId: customer.id,
      products: [],
      systemType: form.systemType.trim(),
      addons: [],
      totalPrice: numberValue(form.totalPrice),
      depositRequired: numberValue(form.depositRequired),
      depositCollected: numberValue(form.depositCollected),
      paymentStatus: form.paymentStatus,
      invoiceNumber: form.invoiceNumber.trim(),
      saleDate: form.saleDate,
      status: form.jobStatus,
      salespersonId: form.salespersonId,
      notes: form.notes.trim(),
    };
    if (job) s.updateJob(job.id, input);
    else s.addJob(input);
    return true;
  };

  const saveInstallation = () => {
    if (!form.address.trim() || !form.startAt || !form.endAt) {
      toast.error("Address, start time, and end time are required");
      return false;
    }
    if (new Date(form.endAt).getTime() <= new Date(form.startAt).getTime()) {
      toast.error("Installation end time must be after the start time");
      return false;
    }
    const selectedEquipment = s.equipment.find((item) => item.id === form.installationEquipmentId);
    const installationEquipment =
      form.installationEquipmentId === "none"
        ? []
        : form.installationEquipmentId === "recorded"
          ? listValue(form.equipment)
          : selectedEquipment
            ? [equipmentLabel(selectedEquipment)]
            : [];
    const input: Omit<Installation, "id"> = {
      customerId: customer.id,
      jobId: form.jobId === "none" ? "" : form.jobId,
      address: form.address.trim(),
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      technicianId: form.technicianId === "unassigned" ? "" : form.technicianId,
      status: form.installStatus,
      equipment: installationEquipment,
      instructions: form.instructions.trim(),
      technicianNotes: form.technicianNotes.trim(),
      beforePhotos: installation?.beforePhotos || 0,
      afterPhotos: installation?.afterPhotos || 0,
      serials: installation?.serials || [],
      completedAt:
        form.installStatus === "Completed"
          ? installation?.completedAt || new Date(form.endAt).toISOString()
          : undefined,
      signatureCaptured: form.signatureCaptured,
      followUpRequired: form.followUpRequired,
    };
    if (installation) s.updateInstallation(installation.id, input);
    else s.addInstallation(input);
    return true;
  };

  const saveMaintenance = () => {
    if (!form.dueDate) {
      toast.error("Maintenance due date is required");
      return false;
    }
    const input: Omit<MaintenanceVisit, "id"> = {
      customerId: customer.id,
      equipmentId: form.equipmentId === "none" ? "" : form.equipmentId,
      dueDate: form.dueDate,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      technicianId: form.technicianId === "unassigned" ? undefined : form.technicianId,
      status: form.maintenanceStatus,
      workPerformed: form.workPerformed.trim() || undefined,
      partsUsed: listValue(form.partsUsed),
      paymentStatus: form.paymentStatus,
      notes: form.notes.trim(),
      completedAt: form.completedAt ? new Date(form.completedAt).toISOString() : undefined,
      nextDueDate: form.nextDueDate || undefined,
    };
    if (maintenance) s.updateMaintenance(maintenance.id, input);
    else s.addMaintenance(input);
    return true;
  };

  const saveTask = () => {
    if (!form.title.trim() || !form.dueAt) {
      toast.error("Task title and due date are required");
      return false;
    }
    const input: Omit<Task, "id" | "createdAt"> = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueAt: new Date(form.dueAt).toISOString(),
      assigneeId: form.assigneeId,
      relatedCustomerId: customer.id,
      priority: form.priority,
      done: form.done,
    };
    if (task) s.updateTask(task.id, input);
    else s.addTask(input);
    return true;
  };

  const handleSave = () => {
    const saved =
      type === "job"
        ? saveJob()
        : type === "installation"
          ? saveInstallation()
          : type === "maintenance"
            ? saveMaintenance()
            : saveTask();
    if (!saved) return;
    toast.success(`${recordId ? "Updated" : "Added"} ${labelFor(type).toLowerCase()}`);
    onOpenChange(false);
  };

  const relatedJobs = s.jobs.filter((item) => item.customerId === customer.id);
  const relatedEquipment = s.equipment.filter((item) => item.customerId === customer.id);
  const technicians = s.users.filter((user) => user.role === "technician");
  const salespeople = s.users.filter((user) => ["salesperson", "admin"].includes(user.role));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recordId ? "Edit" : "Add"} {labelFor(type).toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            This record will be linked to {customer.firstName} {customer.lastName}.
          </DialogDescription>
        </DialogHeader>

        {type === "job" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Invoice number *">
              <Input
                value={form.invoiceNumber}
                onChange={(event) => set("invoiceNumber", event.target.value)}
              />
            </Field>
            <Field label="System type *">
              <Input
                value={form.systemType}
                onChange={(event) => set("systemType", event.target.value)}
              />
            </Field>
            <Field label="Sale date *">
              <Input
                type="date"
                value={form.saleDate}
                onChange={(event) => set("saleDate", event.target.value)}
              />
            </Field>
            <Field label="Job status">
              <Select
                value={form.jobStatus}
                onValueChange={(value) => set("jobStatus", value as JobStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Total price">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.totalPrice}
                onChange={(event) => set("totalPrice", event.target.value)}
              />
            </Field>
            <Field label="Deposit required">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.depositRequired}
                onChange={(event) => set("depositRequired", event.target.value)}
              />
            </Field>
            <Field label="Deposit collected">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.depositCollected}
                onChange={(event) => set("depositCollected", event.target.value)}
              />
            </Field>
            <Field label="Payment status">
              <PaymentStatusSelect
                value={form.paymentStatus}
                onValueChange={(value) => set("paymentStatus", value)}
              />
            </Field>
            <Field label="Salesperson">
              <Select
                value={form.salespersonId}
                onValueChange={(value) => set("salespersonId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {salespeople.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Job notes">
                <Textarea
                  value={form.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  rows={4}
                />
              </Field>
            </div>
          </div>
        )}

        {type === "installation" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Related job">
              <Select value={form.jobId} onValueChange={(value) => set("jobId", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked job</SelectItem>
                  {relatedJobs.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.invoiceNumber} · {item.systemType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.installStatus}
                onValueChange={(value) => set("installStatus", value as Installation["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSTALLATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Installation address *">
                <Input
                  value={form.address}
                  onChange={(event) => set("address", event.target.value)}
                />
              </Field>
            </div>
            <Field label="Start time *">
              <Input
                type="datetime-local"
                value={form.startAt}
                onChange={(event) => set("startAt", event.target.value)}
              />
            </Field>
            <Field label="End time *">
              <Input
                type="datetime-local"
                value={form.endAt}
                onChange={(event) => set("endAt", event.target.value)}
              />
            </Field>
            <Field label="Technician">
              <TechnicianSelect
                value={form.technicianId}
                technicians={technicians}
                onValueChange={(value) => set("technicianId", value)}
              />
            </Field>
            <Field label="Equipment">
              <Select
                value={form.installationEquipmentId}
                onValueChange={(value) => set("installationEquipmentId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked equipment</SelectItem>
                  {form.installationEquipmentId === "recorded" && (
                    <SelectItem value="recorded">Recorded equipment: {form.equipment}</SelectItem>
                  )}
                  {relatedEquipment.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {equipmentLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Instructions">
                <Textarea
                  value={form.instructions}
                  onChange={(event) => set("instructions", event.target.value)}
                  rows={3}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Technician notes">
                <Textarea
                  value={form.technicianNotes}
                  onChange={(event) => set("technicianNotes", event.target.value)}
                  rows={3}
                />
              </Field>
            </div>
            <CheckField
              label="Signature captured"
              checked={form.signatureCaptured}
              onCheckedChange={(checked) => set("signatureCaptured", checked)}
            />
            <CheckField
              label="Follow-up required"
              checked={form.followUpRequired}
              onCheckedChange={(checked) => set("followUpRequired", checked)}
            />
          </div>
        )}

        {type === "maintenance" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Equipment">
              <Select value={form.equipmentId} onValueChange={(value) => set("equipmentId", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked equipment</SelectItem>
                  {relatedEquipment.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {equipmentLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.maintenanceStatus}
                onValueChange={(value) => set("maintenanceStatus", value as MaintenanceStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Due date *">
              <Input
                type="date"
                value={form.dueDate}
                onChange={(event) => set("dueDate", event.target.value)}
              />
            </Field>
            <Field label="Scheduled time">
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) => set("scheduledAt", event.target.value)}
              />
            </Field>
            <Field label="Technician">
              <TechnicianSelect
                value={form.technicianId}
                technicians={technicians}
                onValueChange={(value) => set("technicianId", value)}
              />
            </Field>
            <Field label="Payment status">
              <PaymentStatusSelect
                value={form.paymentStatus}
                onValueChange={(value) => set("paymentStatus", value)}
              />
            </Field>
            <Field label="Completed at">
              <Input
                type="datetime-local"
                value={form.completedAt}
                onChange={(event) => set("completedAt", event.target.value)}
              />
            </Field>
            <Field label="Next due date">
              <Input
                type="date"
                value={form.nextDueDate}
                onChange={(event) => set("nextDueDate", event.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Work performed">
                <Textarea
                  value={form.workPerformed}
                  onChange={(event) => set("workPerformed", event.target.value)}
                  rows={3}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Parts used">
                <Input
                  placeholder="Filter, O-ring"
                  value={form.partsUsed}
                  onChange={(event) => set("partsUsed", event.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Maintenance notes">
                <Textarea
                  value={form.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  rows={3}
                />
              </Field>
            </div>
          </div>
        )}

        {type === "task" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Task title *">
                <Input value={form.title} onChange={(event) => set("title", event.target.value)} />
              </Field>
            </div>
            <Field label="Due at *">
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={(event) => set("dueAt", event.target.value)}
              />
            </Field>
            <Field label="Assignee">
              <Select value={form.assigneeId} onValueChange={(value) => set("assigneeId", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {s.users
                    .filter((user) => user.active)
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select
                value={form.priority}
                onValueChange={(value) => set("priority", value as Task["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="med">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <CheckField
              label="Task completed"
              checked={form.done}
              onCheckedChange={(checked) => set("done", checked)}
            />
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  rows={4}
                />
              </Field>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save {labelFor(type).toLowerCase()}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function labelFor(type: RelatedRecordType) {
  return type === "job"
    ? "Job"
    : type === "installation"
      ? "Installation"
      : type === "maintenance"
        ? "Maintenance"
        : "Task";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function CheckField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-10 items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
      {label}
    </label>
  );
}

function PaymentStatusSelect({
  value,
  onValueChange,
}: {
  value: PaymentStatus;
  onValueChange: (value: PaymentStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as PaymentStatus)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PAYMENT_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TechnicianSelect({
  value,
  technicians,
  onValueChange,
}: {
  value: string;
  technicians: ReturnType<typeof useCRM.getState>["users"];
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
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
  );
}
