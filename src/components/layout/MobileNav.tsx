import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Calendar, Wrench, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", Icon: LayoutDashboard },
  { to: "/customers", label: "Customers", Icon: Users },
  { to: "/calendar", label: "Calendar", Icon: Calendar },
  { to: "/jobs-pipeline", label: "Jobs", Icon: Wrench },
  { to: "/tasks", label: "Tasks", Icon: Menu },
];

export function MobileNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, Icon }) => {
          const active = path === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
