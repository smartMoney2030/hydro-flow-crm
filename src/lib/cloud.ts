import { supabase } from "@/integrations/supabase/client";

/** Store collection key -> database table name */
export const COLLECTION_TABLES = {
  customers: "customers",
  leads: "leads",
  jobs: "jobs",
  supplyOrders: "supply_orders",
  installations: "installations",
  equipment: "equipment",
  equipmentCatalog: "equipment_catalog",
  maintenance: "maintenance_visits",
  tasks: "tasks",
  events: "calendar_events",
  notifications: "notifications",
  audit: "audit_logs",
  automationRules: "automation_rules",
  automationRuns: "automation_runs",
  importBatches: "import_batches",
  inventory: "inventory_items",
} as const;

export type CollectionKey = keyof typeof COLLECTION_TABLES;
export const COLLECTION_KEYS = Object.keys(COLLECTION_TABLES) as CollectionKey[];

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase());

type Row = Record<string, unknown>;

export function rowToApp(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null) continue;
    out[toCamel(k)] = v;
  }
  return out;
}

export function appToRow(item: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(item)) {
    if (v === undefined) continue;
    out[toSnake(k)] = v;
  }
  return out;
}

const table = (name: string) => supabase.from(name as never);

export async function fetchCollection(key: CollectionKey): Promise<Row[]> {
  const { data, error } = await table(COLLECTION_TABLES[key]).select("*");
  if (error) throw error;
  return (data as Row[] | null)?.map(rowToApp) ?? [];
}

export async function upsertRows(key: CollectionKey, items: Row[]) {
  if (!items.length) return;
  const { error } = await table(COLLECTION_TABLES[key]).upsert(
    items.map(appToRow) as never,
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function deleteRows(key: CollectionKey, ids: string[]) {
  if (!ids.length) return;
  const { error } = await table(COLLECTION_TABLES[key]).delete().in("id", ids);
  if (error) throw error;
}
