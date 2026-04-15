import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCreateSamplingPlanMutation,
  useGetChecklistQualificationOptionsQuery,
  useGetSamplingPlansQuery,
  useUpdateSamplingPlanMutation,
} from "@/redux/apis/iqa/iqaApi";
import type {
  ChecklistQualificationOption,
  SamplingPlan,
  SamplingPlanWritePayload,
} from "@/types/iqa.types";

const strategyOptions = [
  { value: "percentage", label: "Percentage Sampling" },
  { value: "full", label: "100% Sampling" },
  { value: "risk_based", label: "Risk Based" },
  { value: "new_assessor", label: "New Trainer" },
  { value: "custom", label: "Custom" },
] as const;

const today = new Date().toISOString().slice(0, 10);

const toArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as T[];
    if (record.data && typeof record.data === "object") {
      const data = record.data as Record<string, unknown>;
      if (Array.isArray(data.results)) return data.results as T[];
      if (Array.isArray(data.items)) return data.items as T[];
    }
    if (Array.isArray(record.items)) return record.items as T[];
  }
  return [];
};

const SamplingSettings = () => {
  const { toast } = useToast();
  const { data: plansResponse, isLoading: isLoadingPlans, isError: isPlansError } = useGetSamplingPlansQuery({ mine: true });
  const { data: qualificationsResponse, isLoading: isLoadingQualifications } = useGetChecklistQualificationOptionsQuery();
  const [createSamplingPlan, { isLoading: isCreating }] = useCreateSamplingPlanMutation();
  const [updateSamplingPlan, { isLoading: isUpdating }] = useUpdateSamplingPlanMutation();

  const [selectedQualificationId, setSelectedQualificationId] = useState("");
  const [newPlanStrategy, setNewPlanStrategy] = useState<"percentage" | "full" | "risk_based" | "new_assessor" | "custom">("percentage");
  const [newPlanPercentage, setNewPlanPercentage] = useState(25);
  const [newPlanStatus, setNewPlanStatus] = useState<"draft" | "active" | "closed">("draft");

  const plans = useMemo<SamplingPlan[]>(() => toArray<SamplingPlan>(plansResponse), [plansResponse]);
  const qualifications = useMemo<ChecklistQualificationOption[]>(
    () => toArray<ChecklistQualificationOption>(qualificationsResponse),
    [qualificationsResponse],
  );
  const qualificationOptions = useMemo(
    () => qualifications.filter((item) => !plans.some((plan) => plan.qualification === item.id)),
    [plans, qualifications],
  );

  const handleCreate = async () => {
    if (!selectedQualificationId) {
      toast({ title: "Please select a qualification", variant: "destructive" });
      return;
    }

    try {
      await createSamplingPlan({
        qualification: selectedQualificationId,
        strategy: newPlanStrategy,
        sample_percentage: newPlanPercentage,
        status: newPlanStatus,
        start_date: today,
        academic_year: new Date().getFullYear().toString(),
      }).unwrap();
      setSelectedQualificationId("");
      setNewPlanStrategy("percentage");
      setNewPlanPercentage(25);
      setNewPlanStatus("draft");
      toast({ title: "Sampling plan created" });
    } catch {
      toast({ title: "Failed to create sampling plan", variant: "destructive" });
    }
  };

  const handleQuickUpdate = async (
    planId: string,
    body: Partial<SamplingPlanWritePayload>,
  ) => {
    try {
      await updateSamplingPlan({ planId, body }).unwrap();
      toast({ title: "Sampling plan updated" });
    } catch {
      toast({ title: "Failed to update sampling plan", variant: "destructive" });
    }
  };

  if (isLoadingPlans || isLoadingQualifications) {
    return <div className="py-20 text-center text-muted-foreground">Loading sampling settings...</div>;
  }

  if (isPlansError) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load sampling settings.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/iqa/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Sampling Configuration</h1>
        <p className="text-sm text-muted-foreground">Manage real IQA sampling plans from the backend API</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Create Sampling Plan</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Select value={selectedQualificationId} onValueChange={setSelectedQualificationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualificationOptions.map((qualification) => (
                  <SelectItem key={qualification.id} value={qualification.id}>
                    {qualification.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Strategy</Label>
            <Select value={newPlanStrategy} onValueChange={(value) => setNewPlanStrategy(value as typeof newPlanStrategy)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strategyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Sampling percentage: <strong>{newPlanPercentage}%</strong></Label>
            <Slider value={[newPlanPercentage]} onValueChange={([value]) => setNewPlanPercentage(value)} min={0} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={newPlanStatus} onValueChange={(value) => setNewPlanStatus(value as typeof newPlanStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No sampling plans found for your IQA profile.
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => {
            const currentPercentage = Number(plan.sample_percentage);
            return (
              <Card key={plan.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{plan.qualification_title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Strategy</Label>
                      <Select
                        value={plan.strategy}
                        onValueChange={(value) => handleQuickUpdate(plan.id, {
                          strategy: value as typeof plan.strategy,
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {strategyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={plan.status}
                        onValueChange={(value) => handleQuickUpdate(plan.id, {
                          status: value as typeof plan.status,
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sampling percentage: <strong>{currentPercentage}%</strong></Label>
                    <Slider
                      value={[currentPercentage]}
                      onValueChange={([value]) => handleQuickUpdate(plan.id, {
                        sample_percentage: value,
                      })}
                      min={0}
                      max={100}
                      step={5}
                      disabled={isUpdating}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SamplingSettings;
