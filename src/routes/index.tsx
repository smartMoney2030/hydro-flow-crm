import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useCRM } from "@/store/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { money, shortDate, initials, relDays } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const s = useCRM();
  const now = Date.now();
  const DAY = 86400000;

  const newLeads = s.leads.filter((l) => l.status === "New Lead").length;
  const salesCallsDue = s.leads.filter((l) => l.salesCallAt && new Date(l.salesCallAt).getTime() < now + 2 * DAY && new Date(l.salesCallAt).getTime() > now - DAY).length;
  const quotesOut = s.leads.filter((l) => l.status === "Quote Sent").length;
  const wonThisMonth = s.jobs.filter((j) => new Date(j.saleDate).getMonth() === new Date().getMonth()).length;
  const unpaidDeposits = s.jobs.filter((j) => j.paymentStatus === "Unpaid").length;
  const outstanding = s.jobs.reduce((sum, j) => sum + (j.totalPrice - j.depositCollected), 0);
  const ordersInTransit = s.supplyOrders.filter((o) => o.status === "In Transit" || o.status === "Ordered").length;
  const readyToSchedule = s.jobs.filter((j) => j.status === "Ready to Schedule").length;
  const installsThisWeek = s.installations.filter((i) => new Date(i.startAt).getTime() > now && new Date(i.startAt).getTime() < now + 7 * DAY).length;
  const maint30 = s.maintenance.filter((m) => ["Due Within 30 Days", "Due Within 7 Days"].includes(m.status)).length;
  const overdue = s.maintenance.filter((m) => m.status === "Maintenance Overdue").length;
  const revenue = s.jobs.filter((j) => new Date(j.saleDate).getMonth() === new Date().getMonth()).reduce((a, j) => a + j.totalPrice, 0);
  const totalLeads = s.leads.length;
  const conv = Math.round((s.leads.filter((l) => l.status === "Sale Won").length / Math.max(totalLeads, 1)) * 100);

  const sourceData = Object.entries(
    s.customers.reduce<Record<string, number>>((acc, c) => {
      acc[c.leadSource] = (acc[c.leadSource] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const colors = ["#0e7490", "#0891b2", "#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc", "#155e75"];

  const techWorkload = s.users.filter((u) => u.role === "technician").map((u) => ({
    name: u.name.split(" ")[0],
    installs: s.installations.filter((i) => i.technicianId === u.id && i.status !== "Completed").length,
    maintenance: s.maintenance.filter((m) => m.technicianId === u.id && m.status === "Maintenance Scheduled").length,
  }));

  const upcomingInstalls = s.installations
    .filter((i) => i.status !== "Completed")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 5);

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" description="Everything moving in your business today." />
      <Section className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <StatCard label="New leads" value={newLeads} to="/leads" icon="UserPlus" tone="info" />
          <StatCard label="Sales calls due" value={salesCallsDue} to="/calendar" icon="PhoneCall" />
          <StatCard label="Quotes awaiting" value={quotesOut} to="/sales-pipeline" icon="FileText" tone="warning" />
          <StatCard label="Sales won (MTD)" value={wonThisMonth} to="/sales-pipeline" icon="Trophy" tone="success" />
          <StatCard label="Unpaid deposits" value={unpaidDeposits} to="/jobs-pipeline" icon="CreditCard" tone="danger" />
          <StatCard label="Outstanding balance" value={money(outstanding)} icon="DollarSign" />
          <StatCard label="Orders in transit" value={ordersInTransit} to="/supply-orders" icon="Truck" tone="info" />
          <StatCard label="Ready to schedule" value={readyToSchedule} to="/jobs-pipeline" icon="CalendarPlus" />
          <StatCard label="Installs this week" value={installsThisWeek} to="/installations" icon="HardHat" />
          <StatCard label="Maintenance ≤ 30d" value={maint30} to="/maintenance" icon="ShieldCheck" tone="warning" />
          <StatCard label="Overdue maintenance" value={overdue} to="/maintenance" icon="AlertTriangle" tone="danger" />
          <StatCard label="Revenue (MTD)" value={money(revenue)} icon="TrendingUp" tone="success" />
          <StatCard label="Conversion rate" value={`${conv}%`} icon="Percent" />
          <StatCard label="Total customers" value={s.customers.length} to="/customers" icon="Users" />
          <StatCard label="Open tasks" value={s.tasks.filter((t) => !t.done).length} to="/tasks" icon="CheckSquare" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Technician workload</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <BarChart data={techWorkload}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="installs" fill="#0891b2" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="maintenance" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Lead sources</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                    {sourceData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base">Upcoming installations</CardTitle>
              <Link to="/installations" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingInstalls.map((i) => {
                const c = s.customers.find((c) => c.id === i.customerId)!;
                const t = s.users.find((u) => u.id === i.technicianId);
                return (
                  <Link to="/customers/$id" params={{ id: c.id }} key={i.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/60">
                    <div className="h-9 w-9 rounded-full grid place-items-center text-xs font-semibold text-white shrink-0" style={{ backgroundColor: t?.avatarColor || "#0891b2" }}>
                      {initials(t?.name || "T")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.propertyAddress}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium">{shortDate(i.startAt)}</div>
                      <StatusBadge status={i.status === "In Progress" ? "Installation in Progress" : "Installation Scheduled"} className="text-[10px]" />
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base">Maintenance alerts</CardTitle>
              <Link to="/maintenance" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {s.maintenance
                .filter((m) => ["Maintenance Overdue", "Due Within 7 Days", "Due Within 30 Days"].includes(m.status))
                .slice(0, 5)
                .map((m) => {
                  const c = s.customers.find((c) => c.id === m.customerId)!;
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/60">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-muted-foreground">{relDays(m.dueDate)}</div>
                      </div>
                      <StatusBadge status={m.status} className="text-[10px]" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card bg-gradient-hero text-white border-0">
          <CardContent className="p-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/25">Automation Center</Badge>
              <div className="mt-2 text-lg font-semibold">{s.automationRules.filter((r) => r.enabled).length} of {s.automationRules.length} rules active</div>
              <div className="text-sm text-white/80">Automations processed {s.automationRules.reduce((a, r) => a + r.runsToday, 0)} events today.</div>
            </div>
            <Link to="/automations" className="rounded-md bg-white text-primary px-4 py-2 text-sm font-medium hover:bg-white/90 shrink-0">Open</Link>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
