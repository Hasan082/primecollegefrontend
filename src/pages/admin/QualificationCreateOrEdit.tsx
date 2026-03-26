import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";

import QualificationDetails from "@/components/admin/qualification-create/QualificationDetails";
import QualificationPrice from "@/components/admin/qualification-create/QualificationPrice";
import QualificationSessions from "@/components/admin/qualification-create/QualificationSessions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import QualificationMain from "@/components/admin/qualification-create/QualificationMain";

const QualificationCreateOrEdit = () => {
  const dispatch = useDispatch();
  const { qualificationId } = useParams();
  const { toast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeStep = Number(searchParams.get("step")) || 1;

  const steps = useMemo(
    () => [
      {
        id: 1,
        label: "Main",
        component: <QualificationMain />,
      },
      {
        id: 2,
        label: "Details",
        component: <QualificationDetails />,
      },
      {
        id: 3,
        label: "Price",
        component: <QualificationPrice />,
      },
      {
        id: 4,
        label: "Session",
        component: <QualificationSessions />,
      },
    ],
    [],
  );

  /**
   * Step Change Handler
   */
  const handleStepChange = (nextStep) => {
    if (!qualificationId && nextStep > 1)
      return toast({ title: "Please Save Qualification info first" });

    // if (nextStep >= 4 && !courseData?.batches?.length)
    //   return SwalUtils.error("Please create at least one batch first");
    // if (nextStep >= 5 && !courseData?.detail?.id)
    //   return SwalUtils.error("Please save Course Details first");

    const newParams = new URLSearchParams();
    newParams.set("step", nextStep);
    setSearchParams(newParams);
  };
  // if()
  return (
    <div className="space-y-xl">
      {/* Navigation */}
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-lg w-full border-2 border-gray-400">
        <div className="flex flex-wrap gap-3">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            return isActive ? (
              <Button key={step.id} onClick={() => handleStepChange(step.id)}>
                {step.label}
              </Button>
            ) : (
              <Button
                variant="secondary"
                key={step.id}
                onClick={() => handleStepChange(step.id)}
              >
                {step.label}
              </Button>
            );
          })}
        </div>
      </div>
      {/* Step Content */}
      <div className="mt-6">
        {steps.map((step) =>
          activeStep === step.id ? (
            <div key={step.id}>{step.component}</div>
          ) : null,
        )}
      </div>
    </div>
  );
};

export default QualificationCreateOrEdit;
