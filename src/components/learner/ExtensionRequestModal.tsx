import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, CalendarPlus } from "lucide-react";
import { EXTENSION_PLANS, type ExtensionPlan } from "@/lib/deadlines";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualificationTitle: string;
  currentExpiry: string;
}

const ExtensionRequestModal = ({ open, onOpenChange, qualificationTitle, currentExpiry }: Props) => {
  const [selectedPlan, setSelectedPlan] = useState<ExtensionPlan | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedPlan) return;
    setSubmitted(true);
    toast({ title: "Extension request submitted", description: `${selectedPlan.label} extension for review` });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setSelectedPlan(null); setSubmitted(false); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" /> Request Deadline Extension
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold">Request Submitted</h3>
            <p className="text-sm text-muted-foreground">
              Your {selectedPlan?.label} extension request is awaiting approval. You'll be notified once reviewed.
            </p>
            <Button onClick={handleClose} className="mt-4">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Qualification</p>
              <p className="text-sm font-medium">{qualificationTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">Current expiry: {currentExpiry}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Select Extension Plan</p>
              <div className="space-y-2">
                {EXTENSION_PLANS.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`p-3 cursor-pointer transition-all border-2 ${
                      selectedPlan?.id === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-muted-foreground/20"
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan?.id === plan.id ? "border-primary" : "border-muted-foreground/30"
                        }`}>
                          {selectedPlan?.id === plan.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{plan.label}</p>
                          <p className="text-xs text-muted-foreground">{plan.months} month{plan.months > 1 ? "s" : ""} additional access</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-sm font-semibold">£{plan.price}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Extension requests require admin/trainer approval. Payment will be collected upon approval.</span>
            </div>

            <Button className="w-full" disabled={!selectedPlan} onClick={handleSubmit}>
              Submit Extension Request {selectedPlan && `— £${selectedPlan.price}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionRequestModal;
