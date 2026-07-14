import { create } from "zustand";
import type {
  AuditLog,
  AutomationRule,
  AutomationRun,
  CalendarEvent,
  Customer,
  Equipment,
  Installation,
  Job,
  JobStatus,
  Lead,
  LeadStatus,
  MaintenanceStatus,
  MaintenanceVisit,
  Notification,
  Role,
  SupplyOrder,
  Task,
  User,
} from "@/data/types";
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
}

const userForRole = (role: Role, users: User[]) =>
  users.find((u) => u.role === role)?.id || users[0].id;

export const useCRM = create<CRMState>((set, get) => ({
  currentUserId: "u1",
  role: "admin",
  users: seedUsers,
  customers: seedCustomers,
  leads: seedLeads,
  jobs: seedJobs,
  supplyOrders: seedSupply,
  installations: seedInstalls,
  equipment: seedEquipment,
  maintenance: seedMaint,
  tasks: seedTasks,
  events: seedEvents,
  notifications: seedNotifs,
  audit: seedAudit,
  automationRules: seedRules,
  automationRuns: seedRuns,

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
