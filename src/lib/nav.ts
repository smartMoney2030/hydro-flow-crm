import type { Role } from "@/data/types";

type NavItem = { label: string; to: string; roles: Role[]; icon: string; group?: string };

export const NAV: NavItem[] = [
  { label: "Dashboard", to: "/", roles: ["admin", "salesperson", "scheduler"], icon: "LayoutDashboard", group: "Overview" },
  { label: "Calendar", to: "/calendar", roles: ["admin", "scheduler", "salesperson"], icon: "Calendar", group: "Overview" },
  { label: "Map", to: "/map", roles: ["admin", "scheduler"], icon: "Map", group: "Overview" },
  { label: "Tasks", to: "/tasks", roles: ["admin", "salesperson", "scheduler"], icon: "CheckSquare", group: "Overview" },

  { label: "Requests", to: "/requests", roles: ["admin", "salesperson", "scheduler"], icon: "Inbox", group: "Sales" },
  { label: "Leads", to: "/leads", roles: ["admin", "salesperson"], icon: "UserPlus", group: "Sales" },
  { label: "Sales Pipeline", to: "/sales-pipeline", roles: ["admin", "salesperson"], icon: "Waves", group: "Sales" },
  { label: "Quotes", to: "/quotes", roles: ["admin", "salesperson"], icon: "FileSignature", group: "Sales" },

  { label: "Jobs Pipeline", to: "/jobs-pipeline", roles: ["admin", "scheduler", "salesperson"], icon: "Wrench", group: "Operations" },
  { label: "Installations", to: "/installations", roles: ["admin", "scheduler"], icon: "HardHat", group: "Operations" },
  { label: "Maintenance", to: "/maintenance", roles: ["admin", "scheduler"], icon: "ShieldCheck", group: "Operations" },
  { label: "Job Forms", to: "/job-forms", roles: ["admin", "scheduler"], icon: "ClipboardList", group: "Operations" },
  { label: "Supply Orders", to: "/supply-orders", roles: ["admin", "scheduler"], icon: "PackageSearch", group: "Operations" },
  { label: "Equipment", to: "/equipment", roles: ["admin", "scheduler"], icon: "Droplet", group: "Operations" },
  { label: "Chemicals", to: "/chemicals", roles: ["admin", "scheduler"], icon: "FlaskConical", group: "Operations" },

  { label: "Customers", to: "/customers", roles: ["admin", "salesperson", "scheduler"], icon: "Users", group: "Clients" },
  { label: "Import Customers", to: "/import-customers", roles: ["admin", "salesperson", "scheduler"], icon: "Upload", group: "Clients" },
  { label: "Client Hub", to: "/client-hub", roles: ["admin", "salesperson", "scheduler"], icon: "Globe", group: "Clients" },

  { label: "Invoices", to: "/invoices", roles: ["admin", "salesperson"], icon: "FileText", group: "Financials" },
  { label: "Payments", to: "/payments", roles: ["admin"], icon: "CreditCard", group: "Financials" },
  { label: "Expenses", to: "/expenses", roles: ["admin"], icon: "Receipt", group: "Financials" },
  { label: "Timesheets", to: "/timesheets", roles: ["admin", "scheduler"], icon: "Clock", group: "Financials" },

  { label: "Marketing", to: "/marketing", roles: ["admin", "salesperson"], icon: "Megaphone", group: "Growth" },
  { label: "Messages", to: "/messages", roles: ["admin", "salesperson", "scheduler"], icon: "MessageSquare", group: "Growth" },
  { label: "Receptionist", to: "/receptionist", roles: ["admin"], icon: "Bot", group: "Growth" },
  { label: "Refer & Earn", to: "/refer-and-earn", roles: ["admin", "salesperson"], icon: "Gift", group: "Growth" },
  { label: "Reports", to: "/reports", roles: ["admin"], icon: "BarChart3", group: "Growth" },

  { label: "Automations", to: "/automations", roles: ["admin"], icon: "Zap", group: "Admin" },
  { label: "Team", to: "/team", roles: ["admin"], icon: "UsersRound", group: "Admin" },
  { label: "Audit Logs", to: "/audit-logs", roles: ["admin"], icon: "ScrollText", group: "Admin" },
  { label: "Settings", to: "/settings", roles: ["admin"], icon: "Settings", group: "Admin" },
];

export const canSee = (item: NavItem, role: Role) => role === "admin" || item.roles.includes(role);
