import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  Edit, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  Eye,
  GraduationCap,
  FileText,
  Briefcase,
  AlertCircle,
  Hash
} from "lucide-react";
import { useGetQualificationQuickViewQuery } from "@/redux/apis/qualification/qualificationMainApi";

interface Props {
  qualificationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StatItem = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase text-muted-foreground font-medium leading-none mb-1">{label}</p>
      <p className="font-semibold text-foreground truncate">{value}</p>
    </div>
  </div>
);

const QualificationQuickView = ({ qualificationId, open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  
  const { data: response, isLoading, isError } = useGetQualificationQuickViewQuery(qualificationId, {
    skip: !qualificationId || !open,
  });

  const q = response?.data;

  const handleEdit = () => {
    if (q?.id) {
      onOpenChange(false);
      navigate(`/admin/qualifications/${q.id}/edit`);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      active: "default",
      draft: "secondary",
      archived: "outline",
      inactive: "destructive",
    };
    return (
      <Badge variant={map[status] || "outline"} className="capitalize px-2 py-0 text-[10px]">
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden border-none shadow-2xl">
        {/* Header - Strictly matching provided fields */}
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xl font-bold text-foreground pr-4" title={q?.title}>
                {q?.title || "Qualification Details"}
              </span>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {q?.qualification_code || "---"}
              </p>
            </div>
            <div className="shrink-0 pt-1">
              {q?.status && statusBadge(q.status)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                <p className="text-xs font-medium text-muted-foreground tracking-wide">LOADING DETAILS</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-destructive text-center">
                <AlertCircle className="w-10 h-10 opacity-50" />
                <p className="text-sm font-medium">Failed to load qualification details.</p>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="mt-2 text-xs">Close</Button>
              </div>
            ) : q ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Stats Grid - All required fields from JSON */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                  <StatItem label="Category" value={q.category_name || "N/A"} icon={BookOpen} />
                  <StatItem label="Level" value={q.level_name || "N/A"} icon={Award} />
                  <StatItem 
                    label="Current Price" 
                    value={q.current_price ? `${q.currency || "GBP"} ${q.current_price}` : "No active price"} 
                    icon={Briefcase} 
                  />
                  <StatItem label="Duration" value={q.course_duration_text || "Not set"} icon={Clock} />
                  <StatItem label="Total Units" value={String(q.total_units ?? 0)} icon={FileText} />
                  <StatItem label="Total Sessions" value={String(q.total_sessions ?? 0)} icon={Hash} />
                  <StatItem label="Is Active" value={q.is_active ? "Yes" : "No"} icon={Eye} />
                  <StatItem label="Is Session" value={q.is_session ? "Yes" : "No"} icon={Calendar} />
                </div>

                {/* Description */}
                {q.short_description && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-3 bg-primary/40 rounded-full" />
                      Short Description
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed font-normal bg-muted/20 p-4 rounded-xl border border-muted-foreground/5">
                      {q.short_description}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-dashed">
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    * Full configuration details (Prerequisites, Pricing rules, and Session dates) are available in the Edit Qualification dashboard.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <div className="px-6 py-5 border-t bg-muted/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-xs font-semibold">
            Cancel
          </Button>
          <Button onClick={handleEdit} size="sm" className="gap-2 px-5 font-bold shadow-md">
            <Edit className="w-3.5 h-3.5" />
            Edit Qualification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QualificationQuickView;
