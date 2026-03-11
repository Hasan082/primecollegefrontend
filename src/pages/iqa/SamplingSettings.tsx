import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { samplingConfig } from "@/data/iqaMockData";

const SamplingSettings = () => {
  const { toast } = useToast();
  const [randomPct, setRandomPct] = useState(samplingConfig.randomPercentage);
  const [autoResub, setAutoResub] = useState(samplingConfig.autoSampleResubmissions);
  const [newTrainer, setNewTrainer] = useState(true);
  const [newTrainerMonths, setNewTrainerMonths] = useState(samplingConfig.newTrainerMonths);

  const handleSave = () => {
    toast({ title: "Sampling settings saved", description: `Random: ${randomPct}%, Auto-resub: ${autoResub ? "On" : "Off"}, New trainer period: ${newTrainerMonths}mo` });
  };

  return (
    <div className="space-y-6">
      <Link to="/iqa/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Sampling Configuration</h1>
        <p className="text-sm text-muted-foreground">Configure how assessments are selected for IQA review</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Random Sampling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Sampling percentage: <strong>{randomPct}%</strong></Label>
              <p className="text-xs text-muted-foreground mb-3">Percentage of all assessments randomly selected for IQA review</p>
              <Slider value={[randomPct]} onValueChange={([v]) => setRandomPct(v)} min={5} max={50} step={5} />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5%</span><span>50%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Automatic Sampling Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Auto-sample resubmissions</Label>
                <p className="text-xs text-muted-foreground">Automatically add resubmission assessments to the IQA queue</p>
              </div>
              <Switch checked={autoResub} onCheckedChange={setAutoResub} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">New trainer sampling</Label>
                <p className="text-xs text-muted-foreground">100% sampling for new trainers during probation</p>
              </div>
              <Switch checked={newTrainer} onCheckedChange={setNewTrainer} />
            </div>
            {newTrainer && (
              <div>
                <Label className="text-sm">Probation period: <strong>{newTrainerMonths} months</strong></Label>
                <Slider value={[newTrainerMonths]} onValueChange={([v]) => setNewTrainerMonths(v)} min={1} max={12} step={1} className="mt-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};

export default SamplingSettings;
