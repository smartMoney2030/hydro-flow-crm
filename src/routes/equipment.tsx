import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EquipmentCatalogCard } from "@/components/equipment/EquipmentCatalogCard";
import { AddEquipmentDialog } from "@/components/equipment/AddEquipmentDialog";
import { shortDate, relDays } from "@/lib/format";
import { Plus, Search, Package, ShieldCheck, Filter } from "lucide-react";

export const Route = createFileRoute("/equipment")({ component: EquipmentPage });

function EquipmentPage() {
  const s = useCRM();
  const [activeTab, setActiveTab] = useState<"catalog" | "installed">("catalog");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const catalog = s.equipmentCatalog || [];

  // Get unique categories for filter
  const categories = Array.from(new Set(catalog.map((i) => i.category))).filter(Boolean);

  // Filter catalog items
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <PageHeader
        eyebrow="Inventory & Catalog"
        title="Equipment Management"
        description={`${catalog.length} products offered · ${s.equipment.length} customer units in service`}
        actions={
          <Button
            onClick={() => {
              setActiveTab("catalog");
              setIsAddDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Equipment
          </Button>
        }
      />

      <Section className="pt-2">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "catalog" | "installed")}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <TabsTrigger value="catalog" className="flex items-center gap-2 text-xs sm:text-sm font-medium px-4">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Equipment Catalog ({catalog.length})</span>
              </TabsTrigger>
              <TabsTrigger value="installed" className="flex items-center gap-2 text-xs sm:text-sm font-medium px-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Installed Units ({s.equipment.length})</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === "catalog" && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs bg-background h-9"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-44 text-xs h-9">
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* TAB 1: Equipment Catalog */}
          <TabsContent value="catalog" className="mt-0">
            {filteredCatalog.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCatalog.map((item) => (
                  <EquipmentCatalogCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">No equipment items found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search query or category filter."
                    : "Your equipment catalog is empty. Click 'Add Equipment' to create your first item."}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add Equipment
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Installed Customer Units */}
          <TabsContent value="installed" className="mt-0">
            <div className="grid gap-3 md:grid-cols-2">
              {s.equipment.map((e) => {
                const c = s.customers.find((c) => c.id === e.customerId);
                return (
                  <Card key={e.id} className="shadow-sm hover:shadow-card">
                    <CardContent className="p-4">
                      {c ? (
                        <Link to="/customers/$id" params={{ id: c.id }} className="block">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{e.type} · {e.model}</div>
                              <div className="text-xs text-muted-foreground truncate">{c.firstName} {c.lastName}</div>
                              <div className="text-[11px] text-muted-foreground">SN {e.serial}</div>
                            </div>
                            <Badge variant="secondary">{e.status}</Badge>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1">
                            <div>Installed: {shortDate(e.installDate)}</div>
                            <div>Warranty: {shortDate(e.warrantyExpires)}</div>
                            <div className="col-span-2">Next maintenance: {shortDate(e.nextMaintenance)} ({relDays(e.nextMaintenance)})</div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{e.type} · {e.model}</div>
                            <div className="text-[11px] text-muted-foreground">SN {e.serial}</div>
                          </div>
                          <Badge variant="secondary">{e.status}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      {/* Add Equipment Dialog */}
      <AddEquipmentDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
