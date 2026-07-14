import type {
  AuditLog,
  AutomationRule,
  AutomationRun,
  CalendarEvent,
  Customer,
  Equipment,
  Installation,
  Job,
  Lead,
  MaintenanceVisit,
  Notification,
  SupplyOrder,
  Task,
  User,
} from "./types";

const DAY = 86400000;
const now = Date.now();
const iso = (offsetDays: number, hour = 9, min = 0) => {
  const d = new Date(now + offsetDays * DAY);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

export const users: User[] = [
  { id: "u1", name: "Alex Rivers", email: "alex@mywaterpeople.com", role: "admin", avatarColor: "#1e40af", active: true, phone: "(210) 555-0101" },
  { id: "u2", name: "Maya Brooks", email: "maya@mywaterpeople.com", role: "salesperson", avatarColor: "#0891b2", active: true, phone: "(210) 555-0102" },
  { id: "u3", name: "Diego Ortiz", email: "diego@mywaterpeople.com", role: "salesperson", avatarColor: "#0e7490", active: true, phone: "(210) 555-0103" },
  { id: "u4", name: "Priya Shah", email: "priya@mywaterpeople.com", role: "scheduler", avatarColor: "#7c3aed", active: true, phone: "(210) 555-0104" },
  { id: "u5", name: "Tomás Reed", email: "tomas@mywaterpeople.com", role: "technician", avatarColor: "#059669", active: true, phone: "(210) 555-0105" },
  { id: "u6", name: "Jordan Kim", email: "jordan@mywaterpeople.com", role: "technician", avatarColor: "#d97706", active: true, phone: "(210) 555-0106" },
  { id: "u7", name: "Sam Whitaker", email: "sam@mywaterpeople.com", role: "technician", avatarColor: "#be185d", active: true, phone: "(210) 555-0107" },
];

const first = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Barbara", "Chris", "Elizabeth", "Daniel", "Susan", "Matthew", "Jessica", "Anthony", "Karen", "Mark", "Nancy", "Steven", "Lisa", "Andrew", "Betty", "Kenneth", "Helen", "Paul", "Sandra", "Joshua", "Donna"];
const last = ["Garcia", "Martinez", "Rodriguez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres"];
const streets = ["Broadway", "Blanco Rd", "Bandera Rd", "Fredericksburg Rd", "Nacogdoches Rd", "Culebra Rd", "Perrin Beitel", "West Ave", "Huebner Rd", "Vance Jackson", "De Zavala Rd", "Bitters Rd", "Loop 1604", "Wurzbach Rd", "Babcock Rd"];
const sources = ["Website Form", "Referral", "Google Search", "Facebook Ad", "Door Hanger", "Home Show", "Repeat Customer"];
const concerns = [["Hard water"], ["Chlorine taste"], ["Iron staining"], ["Hard water", "Chlorine taste"], ["Rotten egg smell"], ["Cloudy water"], ["Low pressure"]];

// San Antonio bbox approx
const SA = { latMin: 29.35, latMax: 29.65, lngMin: -98.72, lngMax: -98.35 };
const rand = (min: number, max: number, seed: number) => {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return min + r * (max - min);
};

export const customers: Customer[] = Array.from({ length: 32 }, (_, i) => {
  const fn = first[i % first.length];
  const ln = last[(i * 3) % last.length];
  const street = `${100 + i * 37} ${streets[i % streets.length]}`;
  return {
    id: `c${i + 1}`,
    firstName: fn,
    lastName: ln,
    phone: `(210) 555-${String(1000 + i * 13).slice(-4)}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
    billingAddress: `${street}, San Antonio, TX 782${String(10 + (i % 40)).padStart(2, "0")}`,
    propertyAddress: `${street}, San Antonio, TX 782${String(10 + (i % 40)).padStart(2, "0")}`,
    lat: rand(SA.latMin, SA.latMax, i + 1),
    lng: rand(SA.lngMin, SA.lngMax, i + 7),
    preferredContact: (["phone", "email", "text"] as const)[i % 3],
    notes: i % 4 === 0 ? "Gate code #4421. Dogs in yard." : "",
    leadSource: sources[i % sources.length],
    createdAt: iso(-(i * 3 + 5)),
  };
});

const leadStatuses = ["New Lead", "Contact Attempted", "Sales Call Scheduled", "Qualified", "Quote Sent", "Follow-Up", "Sale Won", "Sale Lost"] as const;

export const leads: Lead[] = customers.slice(0, 28).map((c, i) => {
  const status = leadStatuses[i % leadStatuses.length];
  const quoteAmount = 1800 + (i * 173) % 6000;
  return {
    id: `l${i + 1}`,
    customerId: c.id,
    status,
    assignedTo: i % 2 === 0 ? "u2" : "u3",
    waterConcerns: concerns[i % concerns.length],
    currentEquipment: i % 3 === 0 ? "None" : i % 3 === 1 ? "Old softener (10+ yrs)" : "Under-sink filter",
    salesCallAt: status !== "New Lead" ? iso(-(i % 14) + 2, 10 + (i % 6)) : undefined,
    followUpAt: status === "Follow-Up" ? iso(2 + (i % 5)) : undefined,
    quoteAmount: ["Quote Sent", "Follow-Up", "Sale Won", "Sale Lost"].includes(status) ? quoteAmount : undefined,
    quoteStatus: status === "Sale Won" ? "Accepted" : status === "Sale Lost" ? "Declined" : status === "Quote Sent" || status === "Follow-Up" ? "Sent" : "Draft",
    lostReason: status === "Sale Lost" ? ["Price", "Went with competitor", "Not ready"][i % 3] : undefined,
    notes: "",
    createdAt: iso(-(i * 2 + 3)),
  };
});

const jobStatuses = ["Payment Pending", "Deposit Collected", "Supplies Need Ordering", "Supplies Ordered", "Awaiting Delivery", "Ready to Schedule", "Installation Scheduled", "Installation in Progress", "Installation Completed", "Follow-Up Required", "Job Closed"] as const;

const wonLeads = leads.filter((l) => l.status === "Sale Won");
// Ensure enough jobs to cover every stage
export const jobs: Job[] = Array.from({ length: 22 }, (_, i) => {
  const cust = customers[i];
  const status = jobStatuses[i % jobStatuses.length];
  const price = 2400 + (i * 213) % 7000;
  const deposit = Math.round(price * 0.3);
  const collected = ["Payment Pending"].includes(status) ? 0 : deposit;
  return {
    id: `j${i + 1}`,
    customerId: cust.id,
    leadId: wonLeads[i % wonLeads.length]?.id,
    products: ["Whole-home softener", "RO drinking system"].slice(0, (i % 2) + 1),
    systemType: i % 2 === 0 ? "Softener + RO" : "Softener only",
    addons: i % 3 === 0 ? ["Sediment pre-filter"] : [],
    totalPrice: price,
    depositRequired: deposit,
    depositCollected: collected,
    paymentStatus: status === "Payment Pending" ? "Unpaid" : status === "Job Closed" ? "Paid" : "Deposit Paid",
    invoiceNumber: `INV-${2024000 + i + 1}`,
    saleDate: iso(-(i * 4 + 2)),
    status,
    salespersonId: i % 2 === 0 ? "u2" : "u3",
    notes: "",
  };
});

export const supplyOrders: SupplyOrder[] = jobs
  .filter((j) => ["Supplies Ordered", "Awaiting Delivery", "Ready to Schedule", "Installation Scheduled", "Installation in Progress", "Installation Completed", "Follow-Up Required", "Job Closed"].includes(j.status))
  .map((j, i) => ({
    id: `so${i + 1}`,
    jobId: j.id,
    vendor: ["AquaWorks Supply", "PureFlow Distribution", "H2O Direct"][i % 3],
    lineItems: [
      { name: "Softener resin tank", qty: 1 },
      { name: "Brine tank", qty: 1 },
      { name: "Bypass valve", qty: 1 },
    ],
    orderDate: iso(-((i + 1) * 3)),
    expectedDelivery: iso(-((i + 1) * 3) + 7),
    actualDelivery: ["Ready to Schedule", "Installation Scheduled", "Installation in Progress", "Installation Completed", "Follow-Up Required", "Job Closed"].includes(j.status) ? iso(-((i + 1) * 3) + 6) : undefined,
    tracking: `1Z${(999000000 + i * 137).toString().slice(0, 12)}`,
    status: j.status === "Supplies Ordered" ? "Ordered" : j.status === "Awaiting Delivery" ? "In Transit" : "Delivered",
    notes: "",
  }));

const techs = ["u5", "u6", "u7"];

export const installations: Installation[] = jobs
  .filter((j) => ["Installation Scheduled", "Installation in Progress", "Installation Completed", "Follow-Up Required", "Job Closed"].includes(j.status))
  .map((j, i) => {
    const done = ["Installation Completed", "Follow-Up Required", "Job Closed"].includes(j.status);
    const dayOffset = done ? -(i + 1) * 2 : (i % 7) + 1;
    return {
      id: `ins${i + 1}`,
      customerId: j.customerId,
      jobId: j.id,
      address: customers.find((c) => c.id === j.customerId)!.propertyAddress,
      startAt: iso(dayOffset, 9 + (i % 4) * 2),
      endAt: iso(dayOffset, 12 + (i % 4) * 2),
      technicianId: techs[i % techs.length],
      status: j.status === "Installation Scheduled" ? "Scheduled" : j.status === "Installation in Progress" ? "In Progress" : "Completed",
      equipment: ["Softener 48k", "RO 5-stage"],
      instructions: "Access via side gate. Water shutoff at front hose bib.",
      technicianNotes: done ? "Install went smoothly. Customer trained on bypass." : "",
      beforePhotos: done ? 3 : 0,
      afterPhotos: done ? 4 : 0,
      serials: done ? [`SN-${(700000 + i * 13).toString()}`, `SN-${(800000 + i * 17).toString()}`] : [],
      completedAt: done ? iso(dayOffset, 12) : undefined,
      signatureCaptured: done,
      followUpRequired: j.status === "Follow-Up Required",
    };
  });

export const equipment: Equipment[] = installations
  .filter((i) => i.status === "Completed")
  .flatMap((inst, idx) => [
    {
      id: `eq${idx * 2 + 1}`,
      customerId: inst.customerId,
      type: "Water Softener",
      model: "AquaGuard 48K",
      serial: inst.serials[0] || `SN-${900000 + idx}`,
      installDate: inst.completedAt!,
      warrantyExpires: new Date(new Date(inst.completedAt!).getTime() + 365 * 5 * DAY).toISOString(),
      status: "Active" as const,
      lastMaintenance: undefined,
      nextMaintenance: new Date(new Date(inst.completedAt!).getTime() + 365 * DAY).toISOString(),
      notes: "",
    },
    {
      id: `eq${idx * 2 + 2}`,
      customerId: inst.customerId,
      type: "RO System",
      model: "PureFlow RO-5",
      serial: inst.serials[1] || `SN-${900500 + idx}`,
      installDate: inst.completedAt!,
      warrantyExpires: new Date(new Date(inst.completedAt!).getTime() + 365 * 3 * DAY).toISOString(),
      status: "Active" as const,
      lastMaintenance: undefined,
      nextMaintenance: new Date(new Date(inst.completedAt!).getTime() + 365 * DAY).toISOString(),
      notes: "",
    },
  ]);

// Sprinkle maintenance visits across every stage
const maintStatuses = ["Active Maintenance Customer", "Due Within 60 Days", "Due Within 30 Days", "Due Within 7 Days", "Maintenance Scheduled", "Maintenance Completed", "Maintenance Overdue", "Maintenance Paused"] as const;

export const maintenanceVisits: MaintenanceVisit[] = equipment.slice(0, 24).map((eq, i) => {
  const status = maintStatuses[i % maintStatuses.length];
  const dueOffset = status === "Maintenance Overdue" ? -14 - i : status === "Due Within 7 Days" ? 3 + (i % 4) : status === "Due Within 30 Days" ? 15 + (i % 12) : status === "Due Within 60 Days" ? 40 + (i % 20) : status === "Maintenance Scheduled" ? 5 + (i % 10) : status === "Maintenance Completed" ? -(30 + i * 3) : 200 + i;
  return {
    id: `mv${i + 1}`,
    customerId: eq.customerId,
    equipmentId: eq.id,
    dueDate: iso(dueOffset),
    scheduledAt: status === "Maintenance Scheduled" || status === "Maintenance Completed" ? iso(dueOffset, 10) : undefined,
    technicianId: status === "Maintenance Scheduled" || status === "Maintenance Completed" ? techs[i % techs.length] : undefined,
    status,
    workPerformed: status === "Maintenance Completed" ? "Replaced sediment filter, sanitized, tested hardness (0 gpg)." : undefined,
    partsUsed: status === "Maintenance Completed" ? ["Sediment filter"] : undefined,
    paymentStatus: status === "Maintenance Completed" ? "Paid" : "Unpaid",
    notes: "",
    completedAt: status === "Maintenance Completed" ? iso(dueOffset, 11) : undefined,
    nextDueDate: status === "Maintenance Completed" ? iso(dueOffset + 365) : undefined,
  };
});

export const tasks: Task[] = [
  { id: "t1", title: "Call new website lead", description: "Home in Alamo Heights, hard water complaint", dueAt: iso(0, 14), assigneeId: "u2", relatedLeadId: "l1", priority: "high", done: false, createdAt: iso(-1) },
  { id: "t2", title: "Send quote to Rodriguez", dueAt: iso(1, 11), assigneeId: "u3", priority: "med", done: false, createdAt: iso(-1) },
  { id: "t3", title: "Collect deposit — Job INV-2024005", dueAt: iso(0, 16), assigneeId: "u2", priority: "high", done: false, createdAt: iso(-2) },
  { id: "t4", title: "Order supplies — INV-2024007", dueAt: iso(-1, 9), assigneeId: "u4", priority: "high", done: false, createdAt: iso(-3) },
  { id: "t5", title: "Schedule install — Perez", dueAt: iso(2, 10), assigneeId: "u4", priority: "med", done: false, createdAt: iso(-1) },
  { id: "t6", title: "Follow-up call after install", dueAt: iso(3, 15), assigneeId: "u2", priority: "low", done: false, createdAt: iso(-1) },
  { id: "t7", title: "Confirm maintenance appt — Lee", dueAt: iso(1, 9), assigneeId: "u4", priority: "med", done: false, createdAt: iso(-2) },
  { id: "t8", title: "Restock van — softener resin", dueAt: iso(0, 8), assigneeId: "u5", priority: "med", done: true, createdAt: iso(-3) },
];

export const events: CalendarEvent[] = [
  ...installations.filter((i) => i.status !== "Completed").map((i) => ({
    id: `ev-i-${i.id}`,
    title: `Install — ${customers.find((c) => c.id === i.customerId)?.lastName}`,
    type: "installation" as const,
    startAt: i.startAt,
    endAt: i.endAt,
    technicianId: i.technicianId,
    customerId: i.customerId,
    relatedId: i.id,
  })),
  ...maintenanceVisits.filter((m) => m.status === "Maintenance Scheduled").map((m) => ({
    id: `ev-m-${m.id}`,
    title: `Maintenance — ${customers.find((c) => c.id === m.customerId)?.lastName}`,
    type: "maintenance" as const,
    startAt: m.scheduledAt!,
    endAt: new Date(new Date(m.scheduledAt!).getTime() + 90 * 60000).toISOString(),
    technicianId: m.technicianId,
    customerId: m.customerId,
    relatedId: m.id,
  })),
  ...leads.filter((l) => l.salesCallAt && daysAhead(l.salesCallAt) > -3 && daysAhead(l.salesCallAt) < 14).map((l) => ({
    id: `ev-sc-${l.id}`,
    title: `Sales call — ${customers.find((c) => c.id === l.customerId)?.lastName}`,
    type: "sales-call" as const,
    startAt: l.salesCallAt!,
    endAt: new Date(new Date(l.salesCallAt!).getTime() + 60 * 60000).toISOString(),
    customerId: l.customerId,
    technicianId: l.assignedTo,
    relatedId: l.id,
  })),
  { id: "ev-to-1", title: "Jordan — PTO", type: "time-off", startAt: iso(4, 0), endAt: iso(5, 0), technicianId: "u6" },
];

function daysAhead(isoStr: string) {
  return (new Date(isoStr).getTime() - Date.now()) / DAY;
}

export const notifications: Notification[] = [
  { id: "n1", title: "New website lead", body: "James Garcia submitted the contact form.", createdAt: iso(0, 8), read: false, kind: "info", href: "/leads" },
  { id: "n2", title: "Deposit received", body: "INV-2024003 · $780 collected.", createdAt: iso(0, 10), read: false, kind: "success", href: "/jobs-pipeline" },
  { id: "n3", title: "Maintenance overdue", body: "3 customers are past due — flag on dashboard.", createdAt: iso(-1, 9), read: false, kind: "warning", href: "/maintenance" },
  { id: "n4", title: "Supplies delivered", body: "AquaWorks tracking 1Z999… marked delivered.", createdAt: iso(-1, 14), read: true, kind: "success", href: "/supply-orders" },
];

export const auditLogs: AuditLog[] = [
  { id: "a1", actorId: "u2", action: "created", entity: "Lead", entityId: "l1", at: iso(0, 8, 12), detail: "From website form" },
  { id: "a2", actorId: "u3", action: "updated", entity: "Lead", entityId: "l4", at: iso(0, 9, 30), detail: "Status → Quote Sent" },
  { id: "a3", actorId: "u4", action: "scheduled", entity: "Installation", entityId: "ins1", at: iso(-1, 14, 5) },
  { id: "a4", actorId: "u5", action: "completed", entity: "Installation", entityId: "ins3", at: iso(-2, 16, 45) },
  { id: "a5", actorId: "u1", action: "changed_role", entity: "User", entityId: "u3", at: iso(-3, 10, 20), detail: "Salesperson permissions updated" },
];

export const automationRules: AutomationRule[] = [
  { id: "ar1", name: "Website lead intake", trigger: "Website form submitted", effect: "Create customer + lead, assign salesperson, create sales-call task, notify", enabled: true, lastRunAt: iso(0, 8), runsToday: 3 },
  { id: "ar2", name: "Sale won → Job", trigger: "Lead moves to Sale Won", effect: "Create job, create payment task, preserve lead history", enabled: true, lastRunAt: iso(-1, 15), runsToday: 1 },
  { id: "ar3", name: "Deposit collected", trigger: "Required payment received", effect: "Move job to Supplies Need Ordering, create equipment-order task", enabled: true, lastRunAt: iso(0, 10), runsToday: 2 },
  { id: "ar4", name: "Supplies delivered", trigger: "All supplies marked delivered", effect: "Move job to Ready to Schedule, notify scheduler", enabled: true, lastRunAt: iso(-1, 14), runsToday: 1 },
  { id: "ar5", name: "Installation scheduled", trigger: "Installation appointment saved", effect: "Create calendar event, customer confirmation, reminders; Google Cal sync", enabled: true, lastRunAt: iso(-1, 11), runsToday: 4 },
  { id: "ar6", name: "Installation completed", trigger: "Technician completes install", effect: "Create equipment records, save serials/photos/warranty, first maintenance +1yr", enabled: true, lastRunAt: iso(-2, 16), runsToday: 0 },
  { id: "ar7", name: "Maintenance reminders", trigger: "60/30/7 days before due", effect: "Notify customer + create scheduler task; overdue records flagged", enabled: true, lastRunAt: iso(0, 6), runsToday: 6 },
  { id: "ar8", name: "Maintenance completed", trigger: "Maintenance visit completed", effect: "Save service history, set next maintenance +1yr", enabled: true, lastRunAt: iso(-2, 12), runsToday: 0 },
];

export const automationRuns: AutomationRun[] = [
  { id: "arn1", ruleId: "ar1", at: iso(0, 8, 12), status: "success", detail: "Created c1 / l1, task t1, notified Maya" },
  { id: "arn2", ruleId: "ar3", at: iso(0, 10, 3), status: "success", detail: "Job INV-2024003 → Supplies Need Ordering" },
  { id: "arn3", ruleId: "ar4", at: iso(-1, 14, 22), status: "success", detail: "Job INV-2024001 → Ready to Schedule" },
  { id: "arn4", ruleId: "ar7", at: iso(0, 6, 0), status: "success", detail: "6 reminders queued (3× 30-day, 2× 7-day, 1× overdue)" },
  { id: "arn5", ruleId: "ar5", at: iso(-1, 11, 10), status: "success", detail: "Install for Perez synced to calendar" },
  { id: "arn6", ruleId: "ar2", at: iso(-1, 15, 40), status: "success", detail: "Lead l7 converted → Job INV-2024015" },
];
