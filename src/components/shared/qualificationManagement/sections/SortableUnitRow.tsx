import {
    Trash2,
    GripVertical, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    UnitRow,
} from "@/redux/apis/qualification/qualificationUnitApi";
import { UnitExpandedContent } from "./UnitExpandedContent";

// ─── Sortable Unit Row ───────────────────────────────────────────────
export const SortableUnitRow = ({
    unit,
    onDelete,
    onToggleExpand,
    isExpanded,
    isCpd,
    qualificationId
}: {
    unit: UnitRow;
    onDelete: (id: string, code: string) => void;
    onToggleExpand: (id: string) => void;
    isExpanded: boolean;
    isCpd: boolean;
    qualificationId: string;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={`p-0 overflow-hidden transition-all ${isExpanded ? "ring-1 ring-primary/20 shadow-md" : "hover:border-primary/30"}`}>
                <div className="flex items-center gap-3 px-4 py-3 bg-card">
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <Badge variant="outline" className="font-mono text-xs shrink-0 px-2 py-0.5 bg-muted/50">{unit.unit_code}</Badge>
                   
                
                     <span className="text-sm font-semibold flex-1 text-foreground truncate">{unit.title}  <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${unit?.is_mandatory ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"}`}>
                          {unit.is_mandatory ? "Mandatory" : "Optional"}
                      </span></span>
                   
                   

                    <div className="flex items-center gap-2 mr-2">
                        {!isCpd && (
                            <>
                                {unit.has_quiz && <Badge className="text-[9px] bg-blue-600 text-white border-none uppercase font-bold tracking-tight px-1.5 py-0">Quiz</Badge>}
                                {unit.has_written_assignment && <Badge className="text-[9px] bg-amber-500 text-white border-none uppercase font-bold tracking-tight px-1.5 py-0">Written</Badge>}
                                {unit.requires_evidence && <Badge className="text-[9px] bg-emerald-600 text-white border-none uppercase font-bold tracking-tight px-1.5 py-0">Evidence</Badge>}
                            </>
                        )}
                        <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground px-1.5 py-0 bg-muted/30 border-muted-foreground/20">{unit.resource_count} resources</Badge>
                    </div>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" onClick={() => onToggleExpand(unit.id)}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(unit.id, unit.unit_code)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {isExpanded && <UnitExpandedContent unit={unit} isCpd={isCpd} qualificationId={qualificationId} />}
            </Card>
        </div>
    );
};