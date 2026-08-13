import { useState } from "react";
import type { EquipmentCatalogItem } from "@/data/types";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddEquipmentDialog } from "@/components/equipment/AddEquipmentDialog";
import { Trash2, Tag, Layers, Droplet, Pencil } from "lucide-react";

interface EquipmentCatalogCardProps {
  item: EquipmentCatalogItem;
}

export function EquipmentCatalogCard({ item }: EquipmentCatalogCardProps) {
  const { removeCatalogItem } = useCRM();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleDelete = () => {
    removeCatalogItem(item.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow group border-slate-200/80">
        {/* Product Image */}
        <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {item.imageUrl && !imgError ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-500">
              <Droplet className="w-12 h-12 stroke-[1.5]" />
              <span className="text-xs font-semibold mt-1 text-blue-700/80">{item.name}</span>
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-xs text-slate-800 font-medium shadow-xs text-[11px]">
              <Tag className="w-3 h-3 mr-1 text-blue-600" /> {item.category}
            </Badge>
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 bg-white/90 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-full shadow-xs transition-colors backdrop-blur-xs"
              title="Edit item"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-full shadow-xs transition-colors backdrop-blur-xs"
              title="Remove item from catalog"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {item.name}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Sizes / Variations */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {item.sizes && item.sizes.length > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <Layers className="w-3 h-3 text-slate-400" />
                  <span>Available Sizes / Options:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.sizes.map((size, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-[10px] py-0 px-2 font-semibold bg-slate-50 border-slate-200 text-slate-700"
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">Standard Single Size</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Remove Equipment from Sales Catalog?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>"{item.name}"</strong>? It will no longer be listed in your equipment catalog or available for future quotes and sales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
