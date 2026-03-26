import { ArrowLeft, ChevronRight, FileText, Layers3 } from "lucide-react";
import { useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import QualificationDetails from "@/components/admin/qualification-create/QualificationDetails";
import QualificationPrice from "@/components/admin/qualification-create/QualificationPrice";
import QualificationSessions from "@/components/admin/qualification-create/QualificationSessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import QualificationMain from "@/components/admin/qualification-create/QualificationMain";
import { useGetQualificationMainQuery } from "@/redux/apis/qualification/qualificationMainApi";

const SECTION_STYLES = {
  main: "border-l-4 border-l-sky-600",
  details: "border-l-4 border-l-emerald-600",
  pricing: "border-l-4 border-l-amber-600",
  sessions: "border-l-4 border-l-rose-600",
} as const;

const SECTION_BADGES = {
  main: "Foundation",
  details: "Rules & Copy",
  pricing: "Commerce",
  sessions: "Schedule",
} as const;

const ConfigurationCard = ({
  title,
  description,
  badge,
  accentClassName,
  actionLabel,
  onAction,
  hidden = false,
}: {
  title: string;
  description: string;
  badge: string;
  accentClassName: string;
  actionLabel: string;
  onAction: () => void;
  hidden?: boolean;
}) => {
  if (hidden) return null;

  return (
    <Card className={`${accentClassName} rounded-2xl border-slate-200 shadow-none`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.12em]">
              {badge}
            </Badge>
            <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
          </div>
          <Button variant="outline" className="shrink-0 rounded-lg" onClick={onAction}>
            {actionLabel}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
};

const QualificationCreateOrEdit = () => {
  const { qualificationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: qualificationData } = useGetQualificationMainQuery(qualificationId, {
    skip: !qualificationId,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeStep = Number(searchParams.get("step")) || 1;
  const mainRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const sessionsRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);

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

    const targetMap = {
      1: mainRef,
      2: detailsRef,
      3: pricingRef,
      4: sessionsRef,
    } as const;

    window.requestAnimationFrame(() => {
      targetMap[nextStep]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const isSessionBased = Boolean(qualificationData?.data?.is_session);
  const isSessionsVisible = Boolean(qualificationId && isSessionBased);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/admin/qualifications")}
                className="h-9 w-fit rounded-lg px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Qualifications
              </Button>
            </div>
            <div className="space-y-2">
              <Badge className="rounded-full bg-slate-900 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white hover:bg-slate-900">
                Qualification Builder
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                {qualificationId ? "Edit Qualification" : "Create Qualification"}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                Save the qualification shell first, then configure the additional sections below.
                CPD details should only be completed for CPD qualifications, and sessions should only
                be managed for session-based qualifications.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {steps
              .filter((step) => step.id !== 4 || isSessionsVisible)
              .map((step) => {
                const isActive = activeStep === step.id;
                return (
                  <Button
                    key={step.id}
                    variant={isActive ? "default" : "secondary"}
                    onClick={() => handleStepChange(step.id)}
                    className="rounded-lg"
                  >
                    {step.label}
                  </Button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Legacy tab layout retained temporarily during UI transition.
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
      */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <div className="space-y-6">
          <div ref={mainRef} className="scroll-mt-20">
            <Card className={`${SECTION_STYLES.main} rounded-2xl border-slate-200 shadow-none`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-sky-100 p-3 text-sky-700">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-950">Main Information</CardTitle>
                    <p className="text-sm text-slate-600">
                      Identity, taxonomy, visibility, learner-facing summary, and session toggle.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <QualificationMain />
              </CardContent>
            </Card>
          </div>

          <div ref={detailsRef} className="scroll-mt-20">
            <Card className="rounded-2xl border-slate-200 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-slate-950">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <QualificationDetails />
              </CardContent>
            </Card>
          </div>

          {isSessionsVisible ? (
            <div ref={sessionsRef} className="scroll-mt-20">
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-slate-950">Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <QualificationSessions />
                </CardContent>
              </Card>
            </div>
          ) : null}

          <div ref={pricingRef} className="scroll-mt-20">
            <Card className="rounded-2xl border-slate-200 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-slate-950">Price</CardTitle>
              </CardHeader>
              <CardContent>
                <QualificationPrice />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <ConfigurationCard
            title="Details"
            description="Access duration, description, certificate rules, learner declarations, and CPD-only settings."
            badge={SECTION_BADGES.details}
            accentClassName={SECTION_STYLES.details}
            actionLabel="Open Details"
            onAction={() => handleStepChange(2)}
          />

          <ConfigurationCard
            title="Pricing"
            description="Add and maintain active pricing records separately from the qualification shell."
            badge={SECTION_BADGES.pricing}
            accentClassName={SECTION_STYLES.pricing}
            actionLabel="Open Pricing"
            onAction={() => handleStepChange(3)}
          />

          <ConfigurationCard
            title="Sessions"
            description="Manage dates and locations only when the qualification is marked as session-based."
            badge={SECTION_BADGES.sessions}
            accentClassName={SECTION_STYLES.sessions}
            actionLabel="Open Sessions"
            onAction={() => handleStepChange(4)}
            hidden={!isSessionsVisible}
          />

          <Card className="rounded-2xl border-dashed border-slate-300 bg-slate-50 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-200 p-3 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base text-slate-900">Field Ownership</CardTitle>
                  <p className="text-sm text-slate-600">Use one source of truth per section.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">Main</p>
                <p>Title, code, type, level, delivery mode, description snippet, status, and session toggle.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">Details</p>
                <p>Access duration, long description, certificate rules, pass mark, and CPD-only fields.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">Sessions</p>
                <p>Only available when session-based is enabled.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QualificationCreateOrEdit;
