import { useEffect, useState } from "react";
import type { Customer, Equipment } from "@/data/types";
import { useCRM } from "@/store/crm";
import { Button } from "@/components/ui/button";
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

interface EquipmentDialogProps {
  customer: Customer;
  equipmentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EquipmentForm {
  type: string;
  model: string;
  serial: string;
  installDate: string;
  warrantyExpires: string;
  status: Equipment["status"];
  lastMaintenance: string;
  nextMaintenance: string;
  notes: string;
}

const dateValue = (value?: string) => value?.slice(0, 10) || "";
const today = () => new Date().toISOString().slice(0, 10);
const nextYear = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const blankForm = (customer: Customer): EquipmentForm => {
  const installDate = dateValue(customer.originalInstallDate) || today();
  return {
    type: "",
    model: "",
    serial: "",
    installDate,
    warrantyExpires: "",
    status: customer.stage === "Inactive Customer" ? "Retired" : "Active",
    lastMaintenance: "",
    nextMaintenance: nextYear(installDate),
    notes: "",
  };
};

const toForm = (equipment: Equipment): EquipmentForm => ({
  type: equipment.type,
  model: equipment.model,
  serial: equipment.serial,
  installDate: dateValue(equipment.installDate),
  warrantyExpires: dateValue(equipment.warrantyExpires),
  status: equipment.status,
  lastMaintenance: dateValue(equipment.lastMaintenance),
  nextMaintenance: dateValue(equipment.nextMaintenance),
  notes: equipment.notes,
});

export function EquipmentDialog({
  customer,
  equipmentId,
  open,
  onOpenChange,
}: EquipmentDialogProps) {
  const s = useCRM();
  const equipment = equipmentId ? s.equipment.find((item) => item.id === equipmentId) : undefined;
  const [form, setForm] = useState<EquipmentForm>(() => blankForm(customer));

  useEffect(() => {
    if (!open) return;
    setForm(equipment ? toForm(equipment) : blankForm(customer));
  }, [customer, equipment, open]);

  const set = <K extends keyof EquipmentForm>(key: K, value: EquipmentForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    if (!form.type.trim() || !form.model.trim() || !form.installDate || !form.nextMaintenance) {
      toast.error("Type, model, install date, and next maintenance date are required");
      return;
    }

    const input: Omit<Equipment, "id"> = {
      customerId: customer.id,
      type: form.type.trim(),
      model: form.model.trim(),
      serial: form.serial.trim() || "—",
      installDate: form.installDate,
      warrantyExpires: form.warrantyExpires || form.installDate,
      status: form.status,
      lastMaintenance: form.lastMaintenance || undefined,
      nextMaintenance: form.nextMaintenance,
      notes: form.notes.trim(),
    };

    if (equipment) s.updateEquipment(equipment.id, input);
    else s.addEquipment(input);
    toast.success(`${equipment ? "Updated" : "Added"} equipment`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipment ? "Edit equipment" : "Add equipment"}</DialogTitle>
          <DialogDescription>
            This equipment record will be linked to {customer.firstName} {customer.lastName}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Equipment type *">
            <Input
              placeholder="Water softener"
              value={form.type}
              onChange={(event) => set("type", event.target.value)}
            />
          </Field>
          <Field label="Model *">
            <Input value={form.model} onChange={(event) => set("model", event.target.value)} />
          </Field>
          <Field label="Serial number">
            <Input value={form.serial} onChange={(event) => set("serial", event.target.value)} />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(value) => set("status", value as Equipment["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Needs Service">Needs Service</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Install date *">
            <Input
              type="date"
              value={form.installDate}
              onChange={(event) => set("installDate", event.target.value)}
            />
          </Field>
          <Field label="Warranty expires">
            <Input
              type="date"
              value={form.warrantyExpires}
              onChange={(event) => set("warrantyExpires", event.target.value)}
            />
          </Field>
          <Field label="Last maintenance">
            <Input
              type="date"
              value={form.lastMaintenance}
              onChange={(event) => set("lastMaintenance", event.target.value)}
            />
          </Field>
          <Field label="Next maintenance *">
            <Input
              type="date"
              value={form.nextMaintenance}
              onChange={(event) => set("nextMaintenance", event.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Equipment notes">
              <Textarea
                value={form.notes}
                onChange={(event) => set("notes", event.target.value)}
                rows={4}
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save equipment</Button>
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
