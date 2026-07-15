import type { Customer, CustomerStage, PaymentStatus } from "@/data/types";

export const CUSTOMER_STAGES: CustomerStage[] = [
  "Existing Customer",
  "Installation Pending",
  "Installation Completed",
  "Active Maintenance Customer",
  "Maintenance Due",
  "Maintenance Overdue",
  "Inactive Customer",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["Unpaid", "Deposit Paid", "Partially Paid", "Paid"];

export const IMPORT_FIELDS: readonly { key: string; label: string; required?: boolean }[] = [
  { key: "firstName", label: "First name", required: true },
  { key: "lastName", label: "Last name", required: true },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "billingAddress", label: "Billing address" },
  { key: "propertyAddress", label: "Property address", required: true },
  { key: "originalSaleDate", label: "Original sale date" },
  { key: "originalInstallDate", label: "Original install date" },
  { key: "equipmentType", label: "Equipment type" },
  { key: "equipmentModel", label: "Equipment model" },
  { key: "equipmentSerial", label: "Equipment serial" },
  { key: "warrantyExpires", label: "Warranty expiration" },
  { key: "purchasePrice", label: "Purchase price" },
  { key: "paymentStatus", label: "Payment status" },
  { key: "lastMaintenance", label: "Last maintenance date" },
  { key: "nextMaintenance", label: "Next maintenance date" },
  { key: "salespersonName", label: "Assigned salesperson" },
  { key: "technicianName", label: "Assigned technician" },
  { key: "notes", label: "Customer notes" },
  { key: "previousServiceHistory", label: "Previous service history" },
  { key: "enrolledInMaintenance", label: "Enrolled in annual maintenance" },
  { key: "stage", label: "Current stage" },
];

export type ImportFieldKey =
  | "firstName" | "lastName" | "phone" | "email" | "billingAddress" | "propertyAddress"
  | "originalSaleDate" | "originalInstallDate" | "equipmentType" | "equipmentModel"
  | "equipmentSerial" | "warrantyExpires" | "purchasePrice" | "paymentStatus"
  | "lastMaintenance" | "nextMaintenance" | "salespersonName" | "technicianName"
  | "notes" | "previousServiceHistory" | "enrolledInMaintenance" | "stage";

export function csvTemplate(): string {
  const headers = IMPORT_FIELDS.map((f) => f.label);
  const example = [
    "Jane", "Doe", "(210) 555-9911", "jane@example.com",
    "1201 Broadway, San Antonio, TX 78215", "1201 Broadway, San Antonio, TX 78215",
    "2022-04-10", "2022-04-18", "Whole-home filtration", "WP-Pro 3000", "SN-88421",
    "2027-04-18", "4200", "Paid", "2024-04-18", "2025-04-18",
    "Maya Brooks", "Tomás Reed", "Gate code #1201", "Filter swap 2023-10; leak check 2024-04",
    "yes", "Active Maintenance Customer",
  ];
  return headers.join(",") + "\n" + example.map(csvEscape).join(",") + "\n";
}

function csvEscape(v: string) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function guessMapping(headers: string[]): Record<string, ImportFieldKey | ""> {
  const map: Record<string, ImportFieldKey | ""> = {};
  // Google Contacts CSV aliases → CRM field keys (first match wins per field)
  const aliases: Record<string, ImportFieldKey> = {
    firstname: "firstName",
    givenname: "firstName",
    lastname: "lastName",
    familyname: "lastName",
    surname: "lastName",
    email1value: "email",
    emailvalue: "email",
    email: "email",
    phone1value: "phone",
    phonevalue: "phone",
    mobile: "phone",
    phone: "phone",
    address1formatted: "propertyAddress",
    address1street: "propertyAddress",
    formattedaddress: "propertyAddress",
    address: "propertyAddress",
    address2formatted: "billingAddress",
    address2street: "billingAddress",
    notes: "notes",
  };
  const used = new Set<ImportFieldKey>();
  for (const h of headers) {
    const norm = h.toLowerCase().replace(/[^a-z0-9]/g, "");
    const aliasKey = aliases[norm];
    if (aliasKey && !used.has(aliasKey)) {
      map[h] = aliasKey;
      used.add(aliasKey);
      continue;
    }
    const match = IMPORT_FIELDS.find((f) => {
      const fn = f.label.toLowerCase().replace(/[^a-z0-9]/g, "");
      const kn = f.key.toLowerCase().replace(/[^a-z0-9]/g, "");
      return fn === norm || kn === norm;
    });
    if (match && !used.has(match.key as ImportFieldKey)) {
      map[h] = match.key as ImportFieldKey;
      used.add(match.key as ImportFieldKey);
    } else {
      map[h] = "";
    }
  }
  return map;
}

// deterministic-ish coordinates within San Antonio bbox
const SA = { latMin: 29.35, latMax: 29.65, lngMin: -98.72, lngMax: -98.35 };
export function geocode(address: string): { lat: number; lng: number } {
  let seed = 0;
  for (let i = 0; i < address.length; i++) seed = (seed * 31 + address.charCodeAt(i)) >>> 0;
  const r1 = (Math.sin(seed + 1) * 10000) % 1;
  const r2 = (Math.sin(seed + 7) * 10000) % 1;
  const f = (x: number) => x - Math.floor(x);
  return {
    lat: SA.latMin + f(Math.abs(r1)) * (SA.latMax - SA.latMin),
    lng: SA.lngMin + f(Math.abs(r2)) * (SA.lngMax - SA.lngMin),
  };
}

const digits = (s?: string) => (s || "").replace(/\D/g, "");
const norm = (s?: string) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");

export type DuplicateMatch = { customer: Customer; reasons: string[]; score: number };

export function findDuplicates(candidate: Partial<Customer>, customers: Customer[]): DuplicateMatch[] {
  const results: DuplicateMatch[] = [];
  const cName = norm(`${candidate.firstName || ""} ${candidate.lastName || ""}`);
  const cPhone = digits(candidate.phone);
  const cEmail = norm(candidate.email);
  const cAddr = norm(candidate.propertyAddress);
  for (const cust of customers) {
    const reasons: string[] = [];
    let score = 0;
    if (cPhone && digits(cust.phone) === cPhone) { reasons.push("Same phone"); score += 3; }
    if (cEmail && norm(cust.email) === cEmail) { reasons.push("Same email"); score += 3; }
    if (cAddr && norm(cust.propertyAddress) === cAddr) { reasons.push("Same property address"); score += 3; }
    if (cName && norm(`${cust.firstName} ${cust.lastName}`) === cName) { reasons.push("Same name"); score += 2; }
    if (score >= 2) results.push({ customer: cust, reasons, score });
  }
  return results.sort((a, b) => b.score - a.score);
}

export function addYear(iso: string): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export function toISODateOrUndef(v?: string): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function parseBool(v?: string): boolean {
  if (!v) return false;
  return ["yes", "y", "true", "1", "enrolled", "active"].includes(String(v).trim().toLowerCase());
}
