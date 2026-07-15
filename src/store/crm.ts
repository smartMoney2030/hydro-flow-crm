import { create } from "zustand";
import type {
  AuditLog,
  AutomationRule,
  AutomationRun,
  CalendarEvent,
  Customer,
  CustomerStage,
  Equipment,
  ImportBatch,
  Installation,
  Job,
  JobStatus,
  Lead,
  LeadStatus,
  MaintenanceStatus,
  MaintenanceVisit,
  Notification,
  PaymentStatus,
  Role,
  SupplyOrder,
  Task,
  User,
} from "@/data/types";
import { addYear, findDuplicates, geocode, type DuplicateMatch } from "@/lib/import";
import {
  auditLogs as seedAudit,
  automationRules as seedRules,
  automationRuns as seedRuns,
  customers as seedCustomers,
  equipment as seedEquipment,
  events as seedEvents,
  installations as seedInstalls,
  jobs as seedJobs,
  leads as seedLeads,
  maintenanceVisits as seedMaint,
  notifications as seedNotifs,
  supplyOrders as seedSupply,
  tasks as seedTasks,
  users as seedUsers,
} from "@/data/seed";

interface CRMState {
  currentUserId: string;
  role: Role;
  users: User[];
  customers: Customer[];
  leads: Lead[];
  jobs: Job[];
  supplyOrders: SupplyOrder[];
  installations: Installation[];
  equipment: Equipment[];
  maintenance: MaintenanceVisit[];
  tasks: Task[];
  events: CalendarEvent[];
  notifications: Notification[];
  audit: AuditLog[];
  automationRules: AutomationRule[];
  automationRuns: AutomationRun[];
  importBatches: ImportBatch[];

  setRole: (r: Role) => void;
  setLeadStatus: (id: string, s: LeadStatus) => void;
  setJobStatus: (id: string, s: JobStatus) => void;
  setMaintStatus: (id: string, s: MaintenanceStatus) => void;
  toggleTask: (id: string) => void;
  toggleAutomation: (id: string) => void;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;
  rescheduleEvent: (id: string, newStartISO: string) => void;
  reassignEvent: (id: string, techId: string) => void;
  addAudit: (a: Omit<AuditLog, "id" | "at">) => void;
  addAutomationRun: (r: Omit<AutomationRun, "id" | "at">) => void;

  findDuplicateCustomers: (candidate: Partial<Customer>) => DuplicateMatch[];
  addExistingCustomer: (input: ExistingCustomerInput, opts?: { batchId?: string; createLead?: boolean }) => { customer: Customer; equipmentIds: string[]; maintenanceIds: string[]; eventIds: string[] };
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  commitImportBatch: (batch: Omit<ImportBatch, "id" | "createdAt" | "actorId">) => ImportBatch;
  reverseImportBatch: (id: string) => boolean;
}

export interface ExistingCustomerEquipment {
  type: string;
  model: string;
  serial: string;
  warrantyExpires?: string;
}

export interface ExistingCustomerInput {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  billingAddress?: string;
  propertyAddress: string;
  preferredContact?: "phone" | "email" | "text";
  notes?: string;
  leadSource?: string;
  stage: CustomerStage;
  originalSaleDate?: string;
  originalInstallDate?: string;
  purchasePrice?: number;
  paymentStatus?: PaymentStatus;
  assignedSalespersonId?: string;
  assignedTechnicianId?: string;
  enrolledInMaintenance?: boolean;
  lastMaintenance?: string;
  nextMaintenance?: string;
  previousServiceHistory?: string;
  equipment?: ExistingCustomerEquipment[];
  photos?: { name: string; dataUrl: string }[];
  documents?: { name: string; dataUrl: string }[];
}

const stageToMaintStatus: Record<CustomerStage, MaintenanceStatus | null> = {
  "Existing Customer": null,
  "Installation Pending": null,
  "Installation Completed": "Active Maintenance Customer",
  "Active Maintenance Customer": "Active Maintenance Customer",
  "Maintenance Due": "Due Within 30 Days",
  "Maintenance Overdue": "Maintenance Overdue",
  "Inactive Customer": "Maintenance Paused",
};

const userForRole = (role: Role, users: User[]) =>
  users.find((u) => u.role === role)?.id || users[0].id;

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useCRM = create<CRMState>((set, get) => ({
  currentUserId: "u1",
  role: "admin",
  users: seedUsers,
  customers: [],
  leads: [],
  jobs: [],
  supplyOrders: [],
  installations: [],
  equipment: [],
  maintenance: [],
  tasks: [],
  events: [],
  notifications: [],
  audit: [],
  automationRules: seedRules,
  automationRuns: [],
  importBatches: [],

  findDuplicateCustomers: (candidate) => findDuplicates(candidate, get().customers),

  updateCustomer: (id, patch) => {
    set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    get().addAudit({ actorId: get().currentUserId, action: "updated", entity: "Customer", entityId: id, detail: "Historical data edited" });
  },

  addExistingCustomer: (input, opts) => {
    const coords = geocode(input.propertyAddress);
    const custId = uid("c");
    const customer: Customer = {
      id: custId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || "",
      email: input.email || "",
      billingAddress: input.billingAddress || input.propertyAddress,
      propertyAddress: input.propertyAddress,
      lat: coords.lat,
      lng: coords.lng,
      preferredContact: input.preferredContact || "phone",
      notes: input.notes || "",
      leadSource: input.leadSource || "Existing (imported)",
      createdAt: new Date().toISOString(),
      isHistorical: true,
      stage: input.stage,
      importBatchId: opts?.batchId,
      enrolledInMaintenance: input.enrolledInMaintenance,
      assignedSalespersonId: input.assignedSalespersonId,
      assignedTechnicianId: input.assignedTechnicianId,
      originalSaleDate: input.originalSaleDate,
      originalInstallDate: input.originalInstallDate,
      purchasePrice: input.purchasePrice,
      paymentStatus: input.paymentStatus,
      previousServiceHistory: input.previousServiceHistory,
      photos: input.photos,
      documents: input.documents,
    };

    const equipmentIds: string[] = [];
    const newEquipment: Equipment[] = (input.equipment || []).filter((e) => e.type || e.model || e.serial).map((e) => {
      const id = uid("eq");
      equipmentIds.push(id);
      const installDate = input.originalInstallDate || input.originalSaleDate || new Date().toISOString();
      const nextDue = input.nextMaintenance || (input.originalInstallDate ? addYear(input.originalInstallDate) : addYear(new Date().toISOString()));
      return {
        id,
        customerId: custId,
        type: e.type || "Unknown",
        model: e.model || "—",
        serial: e.serial || "—",
        installDate,
        warrantyExpires: e.warrantyExpires || addYear(addYear(addYear(addYear(addYear(installDate))))),
        status: input.stage === "Inactive Customer" ? "Retired" : "Active",
        lastMaintenance: input.lastMaintenance,
        nextMaintenance: nextDue,
        notes: "Historical record — imported",
      };
    });

    const maintenanceIds: string[] = [];
    const maintStatus = stageToMaintStatus[input.stage];
    let newMaint: MaintenanceVisit[] = [];
    if (maintStatus && (input.enrolledInMaintenance || ["Active Maintenance Customer", "Maintenance Due", "Maintenance Overdue"].includes(input.stage))) {
      const dueDate = input.nextMaintenance || (input.originalInstallDate ? addYear(input.originalInstallDate) : addYear(new Date().toISOString()));
      const mId = uid("m");
      maintenanceIds.push(mId);
      newMaint.push({
        id: mId,
        customerId: custId,
        equipmentId: equipmentIds[0] || "",
        dueDate,
        status: maintStatus,
        paymentStatus: "Unpaid",
        notes: "Historical maintenance record — imported",
        completedAt: input.lastMaintenance,
      });
    }

    const eventIds: string[] = [];
    const newEvents: CalendarEvent[] = [];
    if (input.stage === "Installation Pending" && input.originalInstallDate) {
      const start = new Date(input.originalInstallDate);
      if (start.getTime() > Date.now()) {
        const eid = uid("ev");
        eventIds.push(eid);
        newEvents.push({
          id: eid,
          title: `Installation — ${input.firstName} ${input.lastName}`,
          type: "installation",
          startAt: start.toISOString(),
          endAt: new Date(start.getTime() + 3 * 3600 * 1000).toISOString(),
          technicianId: input.assignedTechnicianId,
          customerId: custId,
          notes: "Imported historical install",
        });
      }
    }
    if (maintStatus && maintenanceIds[0]) {
      const dueDate = newMaint[0].dueDate;
      const start = new Date(dueDate);
      if (start.getTime() > Date.now()) {
        const eid = uid("ev");
        eventIds.push(eid);
        newEvents.push({
          id: eid,
          title: `Maintenance — ${input.firstName} ${input.lastName}`,
          type: "maintenance",
          startAt: start.toISOString(),
          endAt: new Date(start.getTime() + 2 * 3600 * 1000).toISOString(),
          technicianId: input.assignedTechnicianId,
          customerId: custId,
          notes: "Imported historical maintenance",
        });
      }
    }

    set((s) => ({
      customers: [customer, ...s.customers],
      equipment: [...newEquipment, ...s.equipment],
      maintenance: [...newMaint, ...s.maintenance],
      events: [...newEvents, ...s.events],
    }));

    get().addAudit({
      actorId: get().currentUserId,
      action: "imported",
      entity: "Customer",
      entityId: custId,
      detail: `Existing customer added at stage "${input.stage}"`,
    });

    return { customer, equipmentIds, maintenanceIds, eventIds };
  },

  commitImportBatch: (batch) => {
    const ib: ImportBatch = {
      id: uid("ib"),
      createdAt: new Date().toISOString(),
      actorId: get().currentUserId,
      ...batch,
    };
    set((s) => ({ importBatches: [ib, ...s.importBatches] }));
    return ib;
  },

  reverseImportBatch: (id) => {
    const state = get();
    if (state.role !== "admin") return false;
    const batch = state.importBatches.find((b) => b.id === id);
    if (!batch || batch.reversedAt) return false;
    set((s) => ({
      customers: s.customers.filter((c) => !batch.customerIds.includes(c.id)),
      equipment: s.equipment.filter((e) => !batch.equipmentIds.includes(e.id)),
      maintenance: s.maintenance.filter((m) => !batch.maintenanceIds.includes(m.id)),
      events: s.events.filter((e) => !batch.eventIds.includes(e.id)),
      importBatches: s.importBatches.map((b) => (b.id === id ? { ...b, reversedAt: new Date().toISOString() } : b)),
    }));
    get().addAudit({ actorId: state.currentUserId, action: "reversed", entity: "ImportBatch", entityId: id, detail: `Removed ${batch.customerIds.length} imported customers` });
    return true;
  },

  setRole: (role) => {
    const uid = userForRole(role, get().users);
    set({ role, currentUserId: uid });
  },
  setLeadStatus: (id, status) => {
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, status } : l)) }));
    get().addAudit({ actorId: get().currentUserId, action: "updated", entity: "Lead", entityId: id, detail: `Status → ${status}` });
    if (status === "Sale Won") {
      get().addAutomationRun({ ruleId: "ar2", status: "success", detail: `Lead ${id} converted (mock job creation)` });
    }
  },
  setJobStatus: (id, status) => {
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, status } : j)) }));
    get().addAudit({ actorId: get().currentUserId, action: "updated", entity: "Job", entityId: id, detail: `Status → ${status}` });
    if (status === "Supplies Need Ordering") get().addAutomationRun({ ruleId: "ar3", status: "success", detail: `Job ${id} advanced by deposit` });
    if (status === "Ready to Schedule") get().addAutomationRun({ ruleId: "ar4", status: "success", detail: `Job ${id} supplies delivered` });
    if (status === "Installation Scheduled") get().addAutomationRun({ ruleId: "ar5", status: "success", detail: `Install for ${id} synced to calendar` });
    if (status === "Installation Completed") get().addAutomationRun({ ruleId: "ar6", status: "success", detail: `Equipment records + warranty created for ${id}` });
  },
  setMaintStatus: (id, status) => {
    set((s) => ({ maintenance: s.maintenance.map((m) => (m.id === id ? { ...m, status } : m)) }));
    get().addAudit({ actorId: get().currentUserId, action: "updated", entity: "Maintenance", entityId: id, detail: `Status → ${status}` });
    if (status === "Maintenance Completed") get().addAutomationRun({ ruleId: "ar8", status: "success", detail: `Next visit scheduled +1yr for ${id}` });
  },
  toggleTask: (id) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
  toggleAutomation: (id) =>
    set((s) => ({ automationRules: s.automationRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),
  markNotifRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotifsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  rescheduleEvent: (id, newStartISO) =>
    set((s) => ({
      events: s.events.map((e) => {
        if (e.id !== id) return e;
        const dur = new Date(e.endAt).getTime() - new Date(e.startAt).getTime();
        return { ...e, startAt: newStartISO, endAt: new Date(new Date(newStartISO).getTime() + dur).toISOString() };
      }),
    })),
  reassignEvent: (id, techId) =>
    set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, technicianId: techId } : e)) })),
  addAudit: (a) =>
    set((s) => ({
      audit: [{ id: `a${s.audit.length + 1}-${Date.now()}`, at: new Date().toISOString(), ...a }, ...s.audit].slice(0, 200),
    })),
  addAutomationRun: (r) =>
    set((s) => ({
      automationRuns: [{ id: `arn-${Date.now()}`, at: new Date().toISOString(), ...r }, ...s.automationRuns].slice(0, 100),
    })),
}));

export const useCurrentUser = () => {
  const uid = useCRM((s) => s.currentUserId);
  const users = useCRM((s) => s.users);
  return users.find((u) => u.id === uid)!;
};
