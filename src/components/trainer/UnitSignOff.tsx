import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface UnitSignOffProps {
  unitCode: string;
  unitName: string;
  learnerName: string;
  allCriteriaMet: boolean;
  allSubmissionsReviewed: boolean;
  isSignedOff: boolean;
  onSignOff: () => void;
}

const UnitSignOff = ({
  unitCode,
  unitName,
  learnerName,
  allCriteriaMet,
  allSubmissionsReviewed,
  isSignedOff,
  onSignOff,
}: UnitSignOffProps) => {
  const canSignOff = allCriteriaMet && allSubmissionsReviewed && !isSignedOff;

  if (isSignedOff) {
    return (
      <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Unit Signed Off — Awaiting IQA</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-500">
              {unitCode}: {unitName} — all criteria met for {learnerName}. Sent to IQA queue for verification.
            </p>
          </div>
          <Badge className="ml-auto bg-amber-500 text-white text-xs">Awaiting IQA</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Unit Sign-Off</p>
          <p className="text-xs text-muted-foreground">
            {!allSubmissionsReviewed && "All submissions must be reviewed. "}
            {!allCriteriaMet && "All criteria must be marked as met. "}
            {canSignOff && "Ready for sign-off — all requirements met."}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!canSignOff} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Sign Off Unit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Unit Sign-Off</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to sign off <strong>{unitCode}: {unitName}</strong> as <strong>Competent</strong> for {learnerName}.
                This action confirms all assessment criteria have been met. This will be recorded in the audit trail.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSignOff}>Confirm Sign-Off</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};

export default UnitSignOff;
