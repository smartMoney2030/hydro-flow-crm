import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  // Technician mobile + auth get bare layouts
  if (path.startsWith("/technician") || path.startsWith("/auth")) {
    return <>{children}</>;
  }
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main className="pb-20 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
