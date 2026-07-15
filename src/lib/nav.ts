import type { Role } from "@/data/types";

type NavItem = { label: string; to: string; roles: Role[]; icon: string };

export const NAV: NavItem[] = [
  { label: "Dashboard", to: "/", roles: ["admin", "salesperson", "scheduler"], icon: "LayoutDashboard" },
  { label: "Leads", to: "/leads", roles: ["admin", "salesperson"], icon: "UserPlus" },
  { label: "Sales Pipeline", to: "/sales-pipeline", roles: ["admin", "salesperson"], icon: "Waves" },
  { label: "Jobs Pipeline", to: "/jobs-pipeline", roles: ["admin", "scheduler", "salesperson"], icon: "Wrench" },
  { label: "Customers", to: "/customers", roles: ["admin", "salesperson", "scheduler"], icon: "Users" },
  { label: "Import Customers", to: "/import-customers", roles: ["admin", "salesperson", "scheduler"], icon: "Upload" },
  { label: "Supply Orders", to: "/supply-orders", roles: ["admin", "scheduler"], icon: "PackageSearch" },
  { label: "Calendar", to: "/calendar", roles: ["admin", "scheduler", "salesperson"], icon: "Calendar" },
  { label: "Map", to: "/map", roles: ["admin", "scheduler"], icon: "Map" },
  { label: "Installations", to: "/installations", roles: ["admin", "scheduler"], icon: "HardHat" },
  { label: "Equipment", to: "/equipment", roles: ["admin", "scheduler"], icon: "Droplet" },
  { label: "Maintenance", to: "/maintenance", roles: ["admin", "scheduler"], icon: "ShieldCheck" },
  { label: "Tasks", to: "/tasks", roles: ["admin", "salesperson", "scheduler"], icon: "CheckSquare" },
  { label: "Automations", to: "/automations", roles: ["admin"], icon: "Zap" },
  { label: "Reports", to: "/reports", roles: ["admin"], icon: "BarChart3" },
  { label: "Team", to: "/team", roles: ["admin"], icon: "UsersRound" },
  { label: "Audit Logs", to: "/audit-logs", roles: ["admin"], icon: "ScrollText" },
  { label: "Settings", to: "/settings", roles: ["admin"], icon: "Settings" },
];

export const canSee = (item: NavItem, role: Role) => role === "admin" || item.roles.includes(role);
