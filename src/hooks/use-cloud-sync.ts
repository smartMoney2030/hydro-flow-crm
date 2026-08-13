import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCRM } from "@/store/crm";
import {
  COLLECTION_KEYS,
  deleteRows,
  fetchCollection,
  upsertRows,
  type CollectionKey,
} from "@/lib/cloud";

type Item = { id: string } & Record<string, unknown>;

/** Last known cloud state, per collection: id -> serialized item */
const snapshots = new Map<CollectionKey, Map<string, string>>();
let syncing = false;

const snapshotOf = (items: Item[]) =>
  new Map(items.map((i) => [i.id, JSON.stringify(i)] as const));

function readCollection(key: CollectionKey): Item[] {
  const state = useCRM.getState() as unknown as Record<string, Item[]>;
  return Array.isArray(state[key]) ? state[key] : [];
}

async function pushChanges() {
  for (const key of COLLECTION_KEYS) {
    const items = readCollection(key);
    const prev = snapshots.get(key) ?? new Map<string, string>();
    const next = snapshotOf(items);

    const changed = items.filter((i) => prev.get(i.id) !== next.get(i.id));
    const removed = [...prev.keys()].filter((id) => !next.has(id));

    try {
      if (changed.length) await upsertRows(key, changed);
      if (removed.length) await deleteRows(key, removed);
      snapshots.set(key, next);
    } catch (err) {
      console.error(`[cloud-sync] failed to save ${key}`, err);
    }
  }
}

/**
 * Hydrates the CRM store from the cloud database, then persists every
 * subsequent change back. Only runs for signed-in users.
 */
export function useCloudSync() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "signed-out">("loading");

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const start = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setStatus("signed-out");
        return;
      }

      const patch: Record<string, Item[]> = {};
      for (const key of COLLECTION_KEYS) {
        try {
          const rows = (await fetchCollection(key)) as Item[];
          if (rows.length) {
            patch[key] = rows;
            snapshots.set(key, snapshotOf(rows));
          } else {
            // Nothing stored yet — keep local defaults and seed them upward.
            snapshots.set(key, new Map());
          }
        } catch (err) {
          console.error(`[cloud-sync] failed to load ${key}`, err);
          snapshots.set(key, snapshotOf(readCollection(key)));
        }
      }
      if (cancelled) return;
      if (Object.keys(patch).length) useCRM.setState(patch as never);

      // Seed anything that only exists locally (first run).
      await pushChanges();
      if (cancelled) return;
      setStatus("ready");

      unsubscribe = useCRM.subscribe(() => {
        if (syncing) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          syncing = true;
          void pushChanges().finally(() => {
            syncing = false;
          });
        }, 400);
      });
    };

    void start();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  return status;
}
