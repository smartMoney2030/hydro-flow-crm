export type Role = "admin" | "salesperson" | "scheduler" | "technician";

export type LeadStatus =
  | "New Lead"
  | "Contact Attempted"
  | "Sales Call Scheduled"
  | "Qualified"
  | "Quote Sent"
  | "Follow-Up"
  | "Sale Won"
  | "Sale Lost";

export type JobStatus =
  | "Payment Pending"
  | "Deposit Collected"
  | "Supplies Need Ordering"
  | "Supplies Ordered"
  | "Awaiting Delivery"
  | "Ready to Schedule"
  | "Installation Scheduled"
  | "Installation in Progress"
  | "Installation Completed"
  | "Follow-Up Required"
  | "Job Closed";

export type MaintenanceStatus =
  | "Active Maintenance Customer"
  | "Due Within 60 Days"
  | "Due Within 30 Days"
  | "Due Within 7 Days"
  | "Maintenance Scheduled"
  | "Maintenance Completed"
  | "Maintenance Overdue"
  | "Maintenance Paused";

export type QuoteStatus = "Draft" | "Sent" | "Accepted" | "Declined" | "Expired";
export type PaymentStatus = "Unpaid" | "Deposit Paid" | "Partially Paid" | "Paid";

export type CustomerStage =
  | "Existing Customer"
  | "Installation Pending"
  | "Installation Completed"
  | "Active Maintenance Customer"
  | "Maintenance Due"
  | "Maintenance Overdue"
  | "Inactive Customer";

export interface ImportBatch {
  id: string;
  createdAt: string;
  actorId: string;
  source: "manual" | "csv";
  filename?: string;
  counts: { created: number; updated: number; skipped: number; failed: number };
  customerIds: string[];
  equipmentIds: string[];
  maintenanceIds: string[];
  eventIds: string[];
  leadIds?: string[];
  reversedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  phone?: string;
  active: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  billingAddress: string;
  propertyAddress: string;
  lat: number;
  lng: number;
  preferredContact: "phone" | "email" | "text";
  notes: string;
  leadSource: string;
  createdAt: string;
  isHistorical?: boolean;
  stage?: CustomerStage;
  importBatchId?: string;
  enrolledInMaintenance?: boolean;
  assignedSalespersonId?: string;
  assignedTechnicianId?: string;
  originalSaleDate?: string;
  originalInstallDate?: string;
  purchasePrice?: number;
  paymentStatus?: PaymentStatus;
  previousServiceHistory?: string;
  photos?: { name: string; dataUrl: string }[];
  documents?: { name: string; dataUrl: string }[];
}

export interface Lead {
  id: string;
  customerId: string;
  status: LeadStatus;
  assignedTo: string; // user id
  waterConcerns: string[];
  currentEquipment: string;
  salesCallAt?: string;
  followUpAt?: string;
  quoteAmount?: number;
  quoteStatus: QuoteStatus;
  lostReason?: string;
  notes: string;
  createdAt: string;
}

export interface Job {
  id: string;
  customerId: string;
  leadId?: string;
  products: string[];
  systemType: string;
  addons: string[];
  totalPrice: number;
  depositRequired: number;
  depositCollected: number;
  paymentStatus: PaymentStatus;
  invoiceNumber: string;
  saleDate: string;
  status: JobStatus;
  salespersonId: string;
  notes: string;
}

export interface SupplyOrder {
  id: string;
  jobId: string;
  vendor: string;
  lineItems: { name: string; qty: number }[];
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  tracking?: string;
  status: "Draft" | "Ordered" | "In Transit" | "Delivered" | "Backordered";
  notes: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  onHand: number;
  reorderLevel: number;
  reorderQty: number;
  vendor?: string;
  unitCost?: number;
  location?: string;
  notes?: string;
  updatedAt: string;
}

export interface Installation {
  id: string;
  customerId: string;
  jobId: string;
  address: string;
  startAt: string;
  endAt: string;
  technicianId: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Rescheduled" | "Cancelled";
  equipment: string[];
  instructions: string;
  technicianNotes: string;
  beforePhotos: number;
  afterPhotos: number;
  serials: string[];
  completedAt?: string;
  signatureCaptured: boolean;
  followUpRequired: boolean;
}

export interface Equipment {
  id: string;
  customerId: string;
  type: string;
  model: string;
  serial: string;
  installDate: string;
  warrantyExpires: string;
  status: "Active" | "Needs Service" | "Retired";
  lastMaintenance?: string;
  nextMaintenance: string;
  notes: string;
}

export interface MaintenanceVisit {
  id: string;
  customerId: string;
  equipmentId: string;
  dueDate: string;
  scheduledAt?: string;
  technicianId?: string;
  status: MaintenanceStatus;
  workPerformed?: string;
  partsUsed?: string[];
  paymentStatus: PaymentStatus;
  notes: string;
  completedAt?: string;
  nextDueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueAt: string;
  assigneeId: string;
  relatedCustomerId?: string;
  relatedLeadId?: string;
  relatedJobId?: string;
  priority: "low" | "med" | "high";
  done: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "sales-call" | "follow-up" | "installation" | "maintenance" | "time-off";
  startAt: string;
  endAt: string;
  technicianId?: string;
  customerId?: string;
  relatedId?: string;
  color?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
  kind: "info" | "success" | "warning" | "error";
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  at: string;
  detail?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  effect: string;
  enabled: boolean;
  lastRunAt?: string;
  runsToday: number;
}

export interface AutomationRun {
  id: string;
  ruleId: string;
  at: string;
  status: "success" | "skipped" | "failed";
  detail: string;
}
