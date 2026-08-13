import { Bell, Search, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useRouterState } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV, canSee } from "@/lib/nav";
import * as Icons from "lucide-react";
import { useCRM, useCurrentUser } from "@/store/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { initials, dateTime } from "@/lib/format";
import type { Role } from "@/data/types";

const roles: { role: Role; label: string }[] = [
  { role: "admin", label: "Administrator" },
  { role: "salesperson", label: "Salesperson" },
  { role: "scheduler", label: "Scheduler" },
  { role: "technician", label: "Technician" },
];

export function TopBar() {
  const me = useCurrentUser();
  const role = useCRM((s) => s.role);
  const setRole = useCRM((s) => s.setRole);
  const notifs = useCRM((s) => s.notifications);
  const markAll = useCRM((s) => s.markAllNotifsRead);
  const unread = notifs.filter((n) => !n.read).length;
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthEmail(session?.user.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  const hideOnTech = path.startsWith("/technician");
  if (hideOnTech) return null;

  return (
    <header className="sticky top-0 z-20 h-14 lg:h-16 bg-background/85 backdrop-blur border-b border-border flex items-center gap-3 px-4 lg:px-6">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden -ml-1 gap-1.5 shrink-0" aria-label="Open menu">
            <Menu className="h-4 w-4" />
            <span className="text-xs font-medium">Menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
          <div className="px-5 py-4 font-semibold tracking-tight">My Water People CRM</div>
          <nav className="px-2 pb-6 overflow-y-auto h-[calc(100vh-4rem)]">
            {NAV.filter((i) => canSee(i, role)).map((item) => {
              const Icon =
                (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.icon] ||
                Icons.Circle;
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm " +
                    (active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60")
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers, jobs, invoices..." className="pl-8 h-9 bg-muted/50 border-transparent focus-visible:bg-background" />
      </div>


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <span className="text-muted-foreground">Role:</span>&nbsp;
            <span className="font-medium capitalize">{role}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Switch role (demo)</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {roles.map((r) => (
            <DropdownMenuItem key={r.role} onClick={() => setRole(r.role)}>
              {r.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/technician">Open Technician Mobile</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium grid place-items-center px-1">
                {unread}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAll}>Mark all read</Button>
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto">
            {notifs.slice(0, 8).map((n) => (
              <DropdownMenuItem key={n.id} asChild className="flex-col items-start gap-0.5 py-2">
                <Link to={n.href || "/"}>
                  <div className="flex items-center gap-2 w-full">
                    <Badge variant={n.kind === "warning" ? "destructive" : "secondary"} className="text-[10px]">
                      {n.kind}
                    </Badge>
                    <span className="font-medium text-sm truncate">{n.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground">{dateTime(n.createdAt)}</div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-9 w-9 rounded-full grid place-items-center text-xs font-semibold text-white"
            style={{ backgroundColor: me.avatarColor }}
            aria-label="Account"
          >
            {initials(me.name)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="font-medium">{me.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {authEmail ?? "Not signed in to cloud"}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {authEmail ? (
            <DropdownMenuItem
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
            >
              Sign out
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/auth">Sign in to sync data</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
