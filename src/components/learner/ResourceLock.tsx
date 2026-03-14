import { Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ResourceLockProps {
  qualificationTitle: string;
}

const ResourceLock = ({ qualificationTitle }: ResourceLockProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-base font-bold text-primary mb-1">Downloadable Resources</h3>
      <p className="text-sm text-muted-foreground mb-5">Access unit specifications, templates, and guidance materials</p>

      <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h4 className="text-base font-bold text-foreground mb-1">Resources Locked</h4>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Resources for <strong>{qualificationTitle}</strong> are locked until enrolment and payment are confirmed.
        </p>
        <Link to="/qualifications">
          <Button variant="outline" className="gap-2">
            <CreditCard className="w-4 h-4" /> Complete Enrolment
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ResourceLock;
