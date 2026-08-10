import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRM, type ExistingCustomerInput } from "@/store/crm";
import { DuplicateWarning } from "@/components/import/DuplicateWarning";
import { toast } from "sonner";
import { User, MapPin, Search, ClipboardList, ImageIcon, Upload } from "lucide-react";

const SERVICE_NEEDS = [
  "Water Softener",
  "RO System",
  "Whole House Filtration",
  "Well System Service",
  "General Maintenance",
  "Emergency Repair",
];

const STATES = ["TX", "CA", "FL", "AZ", "NM", "OK", "LA", "CO"];

type Form = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  emailOptIn: boolean;
  phone: string;
  smsOptIn: boolean;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  serviceType: string;
  frequency: string;
  needs: string[];
  propertyType: string;
  timeline: string;
  description: string;
  heardAbout: string;
  referrer: string;
  photos: { name: string; dataUrl: string }[];
};

const empty: Form = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  emailOptIn: false,
  phone: "",
  smsOptIn: false,
  street: "",
  unit: "",
  city: "San Antonio",
  state: "TX",
  zip: "",
  serviceType: "One-time service",
  frequency: "As needed",
  needs: [],
  propertyType: "Residential",
  timeline: "",
  description: "",
  heardAbout: "",
  referrer: "",
  photos: [],
};

export function AddCustomerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const findDupes = useCRM((s) => s.findDuplicateCustomers);
  const addExisting = useCRM((s) => s.addExistingCustomer);
  const commitBatch = useCRM((s) => s.commitImportBatch);

  const [f, setF] = useState<Form>(empty);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const propertyAddress = [
    [f.street, f.unit].filter(Boolean).join(" "),
    [f.city, f.state].filter(Boolean).join(", "),
    f.zip,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const dupes = useMemo(
    () =>
      f.firstName || f.phone || f.email || f.street
        ? findDupes({
            firstName: f.firstName,
            lastName: f.lastName,
            phone: f.phone,
            email: f.email,
            propertyAddress,
          })
        : [],
    [f.firstName, f.lastName, f.phone, f.email, f.street, propertyAddress, findDupes]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.firstName || !f.lastName || !f.street) {
      toast.error("First name, last name, and street address are required");
      return;
    }
    if (f.needs.length === 0) {
      toast.error("Select at least one service need");
      return;
    }
    const notes = [
      f.company && `Company: ${f.company}`,
      `Service: ${f.serviceType}${f.serviceType === "Ongoing maintenance" ? ` (${f.frequency})` : ""}`,
      `Needs: ${f.needs.join(", ")}`,
      `Property: ${f.propertyType}`,
      f.timeline && `Timeline: ${f.timeline}`,
      f.description && `Details: ${f.description}`,
      f.heardAbout && `Heard about us: ${f.heardAbout}`,
      f.referrer && `Referred by: ${f.referrer}`,
      f.emailOptIn && "Opted in to marketing email",
      f.smsOptIn && "Opted in to SMS",
    ]
      .filter(Boolean)
      .join("\n");

    const input: ExistingCustomerInput = {
      firstName: f.firstName,
      lastName: f.lastName,
      phone: f.phone,
      email: f.email,
      billingAddress: propertyAddress,
      propertyAddress,
      preferredContact: f.phone ? "phone" : "email",
      notes,
      stage: "Existing Customer",
      leadSource: f.heardAbout || undefined,
      enrolledInMaintenance: f.serviceType === "Ongoing maintenance",
      equipment: [],
      photos: f.photos,
    };

    const result = addExisting(input);
    commitBatch({
      source: "manual",
      counts: { created: 1, updated: 0, skipped: 0, failed: 0 },
      customerIds: [result.customer.id],
      equipmentIds: result.equipmentIds,
      maintenanceIds: result.maintenanceIds,
      eventIds: result.eventIds,
      leadIds: [],
    });
    toast.success("Customer created");
    setF(empty);
    onOpenChange(false);
    navigate({ to: "/customers/$id", params: { id: result.customer.id } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent

        className="max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl sm:max-w-3xl"
      >
        <form onSubmit={submit} className="flex max-h-[90vh] flex-col">
          <div className="border-b border-border bg-card px-6 py-5 sm:px-8">
            <DialogTitle className="text-2xl font-bold tracking-tight">Add Customer</DialogTitle>
            <DialogDescription className="mt-1">Create a new profile and service request</DialogDescription>
          </div>

          <div className="flex-1 space-y-10 overflow-y-auto px-6 py-8 sm:px-8">
            <SectionHeading icon={<User className="h-4 w-4" />}>Contact Details</SectionHeading>
            <div className="!mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="First Name" required>
                <Input placeholder="John" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </Field>
              <Field label="Last Name" required>
                <Input placeholder="Doe" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Company Name">
                  <Input placeholder="Optional" value={f.company} onChange={(e) => set("company", e.target.value)} />
                </Field>
              </div>
              <div className="space-y-3 md:col-span-2">
                <Field label="Email Address">
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={f.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
                <ConsentRow
                  id="email-optin"
                  checked={f.emailOptIn}
                  onChange={(v) => set("emailOptIn", v)}
                  text="I'd like to receive marketing emails from My Water People. Unsubscribe at any time."
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Field label="Phone Number">
                  <Input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={f.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                <ConsentRow
                  id="sms-optin"
                  checked={f.smsOptIn}
                  onChange={(v) => set("smsOptIn", v)}
                  italic
                  text="By providing a phone number, the customer agrees to receive visit reminders and transactional text messages (SMS). Reply STOP to opt out."
                />
              </div>
            </div>

            {dupes.length > 0 && <DuplicateWarning matches={dupes} />}

            <SectionHeading icon={<MapPin className="h-4 w-4" />}>Address</SectionHeading>
            <div className="!mt-6 grid grid-cols-1 gap-5 md:grid-cols-6">
              <div className="md:col-span-4">
                <Field label="Street Address" required>
                  <Input value={f.street} onChange={(e) => set("street", e.target.value)} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Unit / Suite">
                  <Input value={f.unit} onChange={(e) => set("unit", e.target.value)} />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="City">
                  <Input value={f.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
              </div>
              <div className="md:col-span-1">
                <Field label="State">
                  <Select value={f.state} onValueChange={(v) => set("state", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Zip Code">
                  <Input value={f.zip} onChange={(e) => set("zip", e.target.value)} />
                </Field>
              </div>
            </div>

            <SectionHeading icon={<Search className="h-4 w-4" />}>Service Details</SectionHeading>
            <div className="!mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Service Type" required>
                  <Select value={f.serviceType} onValueChange={(v) => set("serviceType", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-time service">One-time service</SelectItem>
                      <SelectItem value="Ongoing maintenance">Ongoing maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Frequency">
                  <Select value={f.frequency} onValueChange={(v) => set("frequency", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["As needed", "Monthly", "Quarterly", "Annually"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  What are the service needs? <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SERVICE_NEEDS.map((need) => {
                    const checked = f.needs.includes(need);
                    return (
                      <label
                        key={need}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            set("needs", v ? [...f.needs, need] : f.needs.filter((n) => n !== need))
                          }
                        />
                        <span className="text-sm text-muted-foreground">{need}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <SectionHeading icon={<ClipboardList className="h-4 w-4" />}>Project Details</SectionHeading>
            <div className="!mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Property Type">
                  <Select value={f.propertyType} onValueChange={(v) => set("propertyType", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Timeline">
                  <Input
                    placeholder="e.g. As soon as possible"
                    value={f.timeline}
                    onChange={(e) => set("timeline", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Project Description">
                <Textarea
                  rows={3}
                  className="resize-none"
                  placeholder="Briefly describe what the customer needs..."
                  value={f.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="How did they hear about us?">
                  <Select value={f.heardAbout} onValueChange={(v) => set("heardAbout", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Google Search", "Social Media", "Referral", "Yard Sign", "Repeat Customer", "Other"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Referrer name & phone">
                  <Input
                    placeholder="Who referred them?"
                    value={f.referrer}
                    onChange={(e) => set("referrer", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <SectionHeading icon={<ImageIcon className="h-4 w-4" />}>Upload Photos</SectionHeading>
            <label className="!mt-4 block cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary hover:bg-primary/5">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  const encoded = await Promise.all(
                    files.map(
                      (file) =>
                        new Promise<{ name: string; dataUrl: string }>((resolve) => {
                          const r = new FileReader();
                          r.onload = () => resolve({ name: file.name, dataUrl: String(r.result) });
                          r.readAsDataURL(file);
                        })
                    )
                  );
                  set("photos", [...f.photos, ...encoded]);
                }}
              />
              <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">Click or drag images here</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {f.photos.length > 0 ? `${f.photos.length} photo(s) attached` : "PNG, JPG up to 10MB"}
              </p>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-6 py-5 sm:px-8">
            <p className="hidden text-xs text-muted-foreground sm:block">
              Geocoded and added to the map on save.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="px-8 font-semibold shadow-lg shadow-primary/20">
                Create Customer
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-primary">
      <span className="mr-3 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      {children}
    </h3>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ConsentRow({
  id,
  checked,
  onChange,
  text,
  italic,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  text: string;
  italic?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
      <Label
        htmlFor={id}
        className={`cursor-pointer text-xs leading-relaxed font-normal text-muted-foreground ${italic ? "italic" : ""}`}
      >
        {text}
      </Label>
    </div>
  );
}
