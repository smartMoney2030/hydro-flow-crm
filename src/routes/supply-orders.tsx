import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, ShoppingCart, PackageCheck, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { InventoryItem } from "@/data/types";

export const Route = createFileRoute("/supply-orders")({ component: SupplyOrdersPage });

function SupplyOrdersPage() {
  const s = useCRM();
  const inventory = s.inventory;

  const lowStock = inventory.filter((i) => i.onHand <= i.reorderLevel).length;
  const totalUnits = inventory.reduce((a, i) => a + i.onHand, 0);

  const chartData = useMemo(
    () =>
      inventory
        .slice()
        .sort((a, b) => a.onHand / Math.max(1, a.reorderLevel) - b.onHand / Math.max(1, b.reorderLevel))
        .map((i) => ({
          name: i.name.length > 18 ? i.name.slice(0, 16) + "…" : i.name,
          sku: i.sku,
          onHand: i.onHand,
          reorder: i.reorderLevel,
          low: i.onHand <= i.reorderLevel,
        })),
    [inventory]
  );

  return (
    <>
      <PageHeader
        eyebrow="Fulfillment"
        title="Supply Orders & Inventory"
        description={`${s.supplyOrders.length} orders · ${inventory.length} SKUs · ${lowStock} low`}
        actions={
          <div className="flex gap-2">
            <AddInventoryDialog />
            <CreateOrderDialog />
          </div>
        }
      />

      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Package className="h-4 w-4" />} label="SKUs tracked" value={inventory.length} />
          <StatCard icon={<PackageCheck className="h-4 w-4" />} label="Units on hand" value={totalUnits} />
          <StatCard icon={<ShoppingCart className="h-4 w-4" />} label="Low / reorder" value={lowStock} tone={lowStock > 0 ? "warn" : "ok"} />
        </div>
      </Section>

      <Section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inventory levels</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No inventory yet. Click <span className="font-medium">Add inventory</span> to log what you already have on the shelf.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <ReTooltip
                      formatter={(v: number, k: string) => [v, k === "onHand" ? "On hand" : "Reorder at"]}
                      labelFormatter={(l, p) => {
                        const row = p?.[0]?.payload as { sku: string } | undefined;
                        return row ? `${l} · ${row.sku}` : String(l);
                      }}
                    />
                    <Bar dataKey="onHand" radius={[4, 4, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.low ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                      ))}
                    </Bar>
                    <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </Section>

      {inventory.length > 0 && (
        <Section title="Inventory">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">On hand</TableHead>
                    <TableHead className="text-right">Reorder ≤</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Adjust</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.sku}</TableCell>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell className="text-muted-foreground">{i.category}</TableCell>
                      <TableCell className="text-right">
                        <span className={i.onHand <= i.reorderLevel ? "text-destructive font-semibold" : ""}>
                          {i.onHand} {i.unit}
                        </span>
                        {i.onHand <= i.reorderLevel && (
                          <Badge variant="destructive" className="ml-2">Low</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{i.reorderLevel}</TableCell>
                      <TableCell className="text-muted-foreground">{i.vendor || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => s.adjustInventory(i.id, -1, "manual")}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => s.adjustInventory(i.id, 1, "manual")}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => s.removeInventoryItem(i.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Section>
      )}

      <Section title="Purchase orders">
        {s.supplyOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No supply orders yet. Use <span className="font-medium">Create supply order</span> to place one — received items add to inventory automatically.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {s.supplyOrders.map((o) => {
              const j = o.jobId ? s.jobs.find((x) => x.id === o.jobId) : undefined;
              const c = j ? s.customers.find((x) => x.id === j.customerId) : undefined;
              const label = c ? `${c.firstName} ${c.lastName} · ${j!.invoiceNumber}` : `Stock replenishment · ${o.vendor}`;
              const inner = (
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {o.vendor} · {o.lineItems.length} items{o.tracking ? ` · tracking ${o.tracking}` : ""}
                    </div>
                  </div>
                  <div className="text-xs">Ordered {shortDate(o.orderDate)}</div>
                  <div className="text-xs">ETA {shortDate(o.expectedDelivery)}</div>
                  <StatusBadge
                    status={
                      o.status === "In Transit"
                        ? "Awaiting Delivery"
                        : o.status === "Ordered"
                        ? "Supplies Ordered"
                        : "Installation Completed"
                    }
                  />
                  {o.status !== "Delivered" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        s.receiveSupplyOrder(o.id);
                        toast.success("Marked delivered — inventory updated");
                      }}
                    >
                      Mark received
                    </Button>
                  )}
                </div>
              );
              return (
                <Card key={o.id} className="shadow-sm hover:shadow-card">
                  <CardContent className="p-4">
                    {c ? (
                      <Link to="/customers/$id" params={{ id: c.id }}>{inner}</Link>
                    ) : (
                      inner
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone?: "ok" | "warn" }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-md grid place-items-center ${tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddInventoryDialog() {
  const addInventoryItem = useCRM((s) => s.addInventoryItem);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "Filter",
    unit: "ea",
    onHand: 0,
    reorderLevel: 2,
    reorderQty: 5,
    vendor: "",
    unitCost: 0,
    location: "",
    notes: "",
  });

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    addInventoryItem({
      ...form,
      sku: form.sku.trim() || form.name.slice(0, 3).toUpperCase() + "-" + Math.floor(Math.random() * 900 + 100),
      onHand: Number(form.onHand) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      reorderQty: Number(form.reorderQty) || 0,
      unitCost: Number(form.unitCost) || 0,
    });
    toast.success(`Added ${form.name} to inventory`);
    setOpen(false);
    setForm({ sku: "", name: "", category: "Filter", unit: "ea", onHand: 0, reorderLevel: 2, reorderQty: 5, vendor: "", unitCost: 0, location: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Package className="mr-2 h-4 w-4" />
          Add inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add inventory</DialogTitle>
          <DialogDescription>Log stock you already have on the shelf. This does not create a purchase order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Item name *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sediment Filter 10in" />
          </Field>
          <Field label="SKU">
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="auto" />
          </Field>
          <Field label="Category">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Filter", "Membrane", "Salt", "Media", "Fittings", "Tank", "System", "Chemical", "Other"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Unit">
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="ea, bag, ft" />
          </Field>
          <Field label="On hand">
            <Input type="number" value={form.onHand} onChange={(e) => setForm({ ...form, onHand: Number(e.target.value) })} />
          </Field>
          <Field label="Reorder at ≤">
            <Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
          </Field>
          <Field label="Reorder qty">
            <Input type="number" value={form.reorderQty} onChange={(e) => setForm({ ...form, reorderQty: Number(e.target.value) })} />
          </Field>
          <Field label="Unit cost">
            <Input type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
          </Field>
          <Field label="Vendor">
            <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Shelf A-3" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Add to inventory</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateOrderDialog() {
  const inventory = useCRM((s) => s.inventory);
  const jobs = useCRM((s) => s.jobs);
  const customers = useCRM((s) => s.customers);
  const createSupplyOrder = useCRM((s) => s.createSupplyOrder);
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [jobId, setJobId] = useState<string>("none");
  const [eta, setEta] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<{ name: string; qty: number; inventoryId?: string }[]>([{ name: "", qty: 1 }]);

  const setLine = (idx: number, patch: Partial<{ name: string; qty: number; inventoryId?: string }>) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const pickInventory = (idx: number, invId: string) => {
    if (invId === "custom") {
      setLine(idx, { inventoryId: undefined, name: "" });
      return;
    }
    const it = inventory.find((i) => i.id === invId);
    if (it) setLine(idx, { inventoryId: it.id, name: it.name });
  };

  const submit = () => {
    if (!vendor.trim()) return toast.error("Vendor is required");
    const clean = lines.filter((l) => l.name.trim() && l.qty > 0);
    if (clean.length === 0) return toast.error("Add at least one line item");
    createSupplyOrder({
      vendor: vendor.trim(),
      jobId: jobId === "none" ? undefined : jobId,
      expectedDelivery: new Date(eta).toISOString(),
      tracking: tracking || undefined,
      notes,
      lineItems: clean,
    });
    toast.success("Supply order created");
    setOpen(false);
    setVendor("");
    setJobId("none");
    setTracking("");
    setNotes("");
    setLines([{ name: "", qty: 1 }]);
  };

  const suggested: InventoryItem[] = inventory.filter((i) => i.onHand <= i.reorderLevel);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Create supply order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create supply order</DialogTitle>
          <DialogDescription>
            Place an order with a vendor. When you mark it received, quantities are added to inventory.
          </DialogDescription>
        </DialogHeader>

        {suggested.length > 0 && (
          <div className="rounded-md border bg-muted/40 p-3 text-xs">
            <div className="font-medium mb-1">Low stock — click to add</div>
            <div className="flex flex-wrap gap-1.5">
              {suggested.map((i) => (
                <Button
                  key={i.id}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setLines((ls) => [...ls.filter((l) => l.name || l.inventoryId), { inventoryId: i.id, name: i.name, qty: i.reorderQty || 1 }])}
                >
                  + {i.name} ({i.onHand}/{i.reorderLevel})
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Vendor *">
            <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Culligan Supply" />
          </Field>
          <Field label="Link to job (optional)">
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Stock replenishment</SelectItem>
                {jobs.map((j) => {
                  const c = customers.find((c) => c.id === j.customerId);
                  return (
                    <SelectItem key={j.id} value={j.id}>
                      {j.invoiceNumber} — {c ? `${c.firstName} ${c.lastName}` : "unknown"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Expected delivery">
            <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
          </Field>
          <Field label="Tracking #">
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </Field>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label>Line items</Label>
            <Button size="sm" variant="ghost" onClick={() => setLines((ls) => [...ls, { name: "", qty: 1 }])}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add line
            </Button>
          </div>
          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_80px_36px] gap-2">
                <Select value={l.inventoryId || "custom"} onValueChange={(v) => pickInventory(i, v)}>
                  <SelectTrigger><SelectValue placeholder="Inventory / custom" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom item…</SelectItem>
                    {inventory.map((it) => (
                      <SelectItem key={it.id} value={it.id}>{it.name} ({it.onHand})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={l.name}
                  onChange={(e) => setLine(i, { name: e.target.value })}
                  placeholder="Description"
                />
                <Input type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
                <Button size="icon" variant="ghost" onClick={() => setLines((ls) => ls.filter((_, x) => x !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
