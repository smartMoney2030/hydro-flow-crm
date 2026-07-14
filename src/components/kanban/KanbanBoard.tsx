import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  useDraggable,
} from "@dnd-kit/core";
import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KanbanItem {
  id: string;
  status: string;
}

interface KanbanBoardProps<T extends KanbanItem> {
  columns: readonly string[];
  items: T[];
  onMove: (id: string, status: string) => void;
  renderCard: (item: T) => ReactNode;
  columnAccent?: (status: string) => string;
}

export function KanbanBoard<T extends KanbanItem>({
  columns,
  items,
  onMove,
  renderCard,
  columnAccent,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const active = activeId ? items.find((i) => i.id === activeId) : null;

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const overId = e.over?.id?.toString();
    const itemId = e.active.id.toString();
    if (!overId) return;
    const it = items.find((i) => i.id === itemId);
    if (it && it.status !== overId) onMove(itemId, overId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id.toString())}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.status === col);
          return (
            <Column key={col} id={col} count={colItems.length} accent={columnAccent?.(col)}>
              {colItems.map((it) => (
                <DraggableCard key={it.id} id={it.id}>
                  {renderCard(it)}
                </DraggableCard>
              ))}
            </Column>
          );
        })}
      </div>
      <DragOverlay>{active ? <div className="rotate-2 opacity-95">{renderCard(active)}</div> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({ id, count, children, accent }: { id: string; count: number; children: ReactNode; accent?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="w-72 shrink-0 flex flex-col">
      <div className={cn("px-3 py-2 rounded-t-lg font-medium text-sm flex items-center justify-between border-b-2", accent || "border-primary/40 bg-muted/60")}>
        <span className="truncate">{id}</span>
        <span className="text-xs text-muted-foreground bg-background/70 rounded-full px-2 py-0.5">{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[400px] rounded-b-lg p-2 space-y-2 transition-colors",
          isOver ? "bg-accent/10" : "bg-muted/30",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function DraggableCard({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("cursor-grab active:cursor-grabbing shadow-sm hover:shadow-card transition-shadow", isDragging && "opacity-40")}
    >
      {children}
    </Card>
  );
}
