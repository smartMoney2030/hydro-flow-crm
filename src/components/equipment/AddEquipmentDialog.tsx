import { useEffect, useState } from "react";
import { useCRM } from "@/store/crm";
import type { EquipmentCatalogItem } from "@/data/types";
import {
  Dialog as RadixDialog,
  DialogContent as RadixDialogContent,
  DialogHeader as RadixDialogHeader,
  DialogTitle as RadixDialogTitle,
  DialogDescription as RadixDialogDescription,
  DialogFooter as RadixDialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Upload, Sparkles, X } from "lucide-react";

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  "Filtration Systems",
  "Conditioners & Softeners",
  "Whole House Systems",
  "Pumps & Dosing",
  "Replacement Filters",
  "Attachments & Fittings",
  "Supplies & Media",
  "Countertop & Portable",
  "Plumbing & Safety",
  "Accessories & Fixtures",
  "Other",
];

const PRESET_IMAGES = [
  { label: "Water System", url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4e?w=600&auto=format&fit=crop&q=80" },
  { label: "Water Softener", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80" },
  { label: "Filter Cartridge", url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80" },
  { label: "Water Pitcher", url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80" },
  { label: "Metering Pump", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
];

export function AddEquipmentDialog({ open, onOpenChange }: AddEquipmentDialogProps) {
  const { addCatalogItem } = useCRM();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Filtration Systems");
  const [description, setDescription] = useState("");
  const [sizesInput, setSizesInput] = useState("");
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [imagePreview, setImagePreview] = useState<string | null>(PRESET_IMAGES[0].url);
  const [isCustomUrl, setIsCustomUrl] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const sizes = sizesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    addCatalogItem({
      name: name.trim(),
      category,
      description: description.trim() || "No detailed description provided.",
      sizes: sizes.length > 0 ? sizes : undefined,
      imageUrl: imagePreview || undefined,
    });

    // Reset form
    setName("");
    setCategory("Filtration Systems");
    setDescription("");
    setSizesInput("");
    setImageUrl(PRESET_IMAGES[0].url);
    setImagePreview(PRESET_IMAGES[0].url);
    setIsCustomUrl(false);
    onOpenChange(false);
  };

  return (
    <RadixDialog open={open} onOpenChange={onOpenChange}>
      <RadixDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <RadixDialogHeader>
          <RadixDialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-5 h-5 text-blue-600" /> Add New Equipment
          </RadixDialogTitle>
          <RadixDialogDescription>
            Add a new product or equipment unit to your sales catalog with photos, descriptions, and size variations.
          </RadixDialogDescription>
        </RadixDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Equipment Image Section */}
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Product Photo</Label>
            
            {imagePreview && (
              <div className="relative w-full h-44 rounded-lg overflow-hidden border bg-muted group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageUrl("");
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-opacity"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 border border-dashed rounded-md p-2.5 cursor-pointer hover:bg-muted/50 transition-colors text-xs font-medium">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload from Device</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsCustomUrl(!isCustomUrl)}
              >
                <ImagePlus className="w-4 h-4 mr-1 text-blue-600" />
                {isCustomUrl ? "Hide URL Input" : "Custom Image URL"}
              </Button>
            </div>

            {/* Presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-muted-foreground font-medium">Or choose a preset photo:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setImagePreview(preset.url);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      imagePreview === preset.url
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                        : "bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {isCustomUrl && (
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                className="text-xs"
              />
            )}
          </div>

          {/* Equipment Name */}
          <div className="space-y-1.5">
            <Label htmlFor="eq-name">Equipment Name *</Label>
            <Input
              id="eq-name"
              placeholder="e.g., Smart Alkaline Water Refiner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="eq-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="eq-category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sizes / Variants */}
          <div className="space-y-1.5">
            <Label htmlFor="eq-sizes">Sizes / Variations (Optional)</Label>
            <Input
              id="eq-sizes"
              placeholder="e.g. Small, Medium, Large OR 10&quot;, 20&quot; (comma-separated)"
              value={sizesInput}
              onChange={(e) => setSizesInput(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Separate multiple sizes or capacity options with commas.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="eq-desc">Description</Label>
            <Textarea
              id="eq-desc"
              rows={3}
              placeholder="Provide key features, filtration specs, or sales description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <RadixDialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              Save Equipment
            </Button>
          </RadixDialogFooter>
        </form>
      </RadixDialogContent>
    </RadixDialog>
  );
}
