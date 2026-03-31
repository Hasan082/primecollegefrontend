import { CalendarDays, CheckCircle2, ClipboardList, FileText, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RESPONSE_TYPE_LABELS, type ChecklistItem } from "@/lib/checklists";

type ChecklistViewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    title: string;
    isActive: boolean;
    updatedDate: string;
    items: ChecklistItem[];
  } | null;
  qualificationTitle: string;
  unitLabel: string;
};

const ChecklistViewModal = ({
  open,
  onOpenChange,
  template,
  qualificationTitle,
  unitLabel,
}: ChecklistViewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checklist Details</DialogTitle>
        </DialogHeader>

        {template && (
          <div className="space-y-6 pt-2">
            <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-muted/40 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClipboardList className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">
                      Verification Checklist
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{template.title}</h3>
                </div>
                <Badge
                  variant={template.isActive ? "default" : "secondary"}
                  className="w-fit"
                >
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide">Qualification</span>
                </div>
                <p className="text-sm font-medium leading-6">{qualificationTitle}</p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide">Unit</span>
                </div>
                <p className="text-sm font-medium leading-6">{unitLabel}</p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide">Updated</span>
                </div>
                <p className="text-sm font-medium leading-6">{template.updatedDate}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Checklist Items</p>
                  <p className="text-xs text-muted-foreground">
                    {template.items.length} item{template.items.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {template.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-[10px]">
                            {RESPONSE_TYPE_LABELS[item.responseType]}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6">{item.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistViewModal;
