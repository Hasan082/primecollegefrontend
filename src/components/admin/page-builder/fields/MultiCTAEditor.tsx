import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
import Field from "./Field";

interface CTA {
  label: string;
  href: string;
}

interface MultiCTAEditorProps {
  ctas: CTA[];
  onChange: (ctas: CTA[]) => void;
  max?: number;
}

const MultiCTAEditor = ({ ctas = [], onChange, max = 3 }: MultiCTAEditorProps) => {
  const handleAdd = () => {
    if (ctas.length < max) {
      onChange([...ctas, { label: "New Button", href: "" }]);
    }
  };

  const handleRemove = (index: number) => {
    onChange(ctas.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, key: keyof CTA, value: string) => {
    const next = [...ctas];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold">CTA Buttons (Max {max})</Label>
        {ctas.length < max && (
          <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Button
          </Button>
        )}
      </div>

      {ctas.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No buttons added. Using legacy CTA Label if present.</p>
      )}

      <div className="space-y-3">
        {ctas.map((cta, index) => (
          <div key={index} className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/10 relative group">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Button {index + 1}</span>
               <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRemove(index)}
                className="h-6 w-6 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <Trash2 className="h-3 w-3" />
               </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase">Label</Label>
                <Field value={cta.label} onChange={(v) => handleUpdate(index, "label", v)} />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase">Link (Href)</Label>
                <Field value={cta.href} onChange={(v) => handleUpdate(index, "href", v)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiCTAEditor;
