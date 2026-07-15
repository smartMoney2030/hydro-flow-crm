import { Link, useRouterState } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { NAV, canSee } from "@/lib/nav";
import { useCRM } from "@/store/crm";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/my-water-people-logo.png.asset.json";

export function Sidebar() {
  const role = useCRM((s) => s.role);
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl grid place-items-center bg-white/95 shadow-wave overflow-hidden shrink-0">
          <img src={logoAsset.url} alt="My Water People" className="h-10 w-10 object-contain" />
        </div>
        <div>
          <div className="font-semibold tracking-tight">My Water People</div>
          <div className="text-[11px] text-sidebar-foreground/60">CRM</div>
        </div>
      </div>
      <nav className="px-2 py-2 flex-1 overflow-y-auto space-y-0.5">
        {NAV.filter((i) => canSee(i, role)).map((item) => {
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.icon] || Icons.Circle;
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60">
        Demo build · Not for production
      </div>
    </aside>
  );
}
