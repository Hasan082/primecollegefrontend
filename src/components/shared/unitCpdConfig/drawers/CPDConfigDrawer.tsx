import { useState, useCallback, useEffect } from "react";
import {
    Loader2, Settings, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
    useGetUnitCpdConfigQuery,
    useCreateUnitCpdConfigMutation,
    useUpdateUnitCpdConfigMutation,
} from "@/redux/apis/qualification/qualificationUnitApi";


export const CPDConfigDrawer = ({
    unitId,
    unitCode,
    isOpen,
    onClose
}: {
    unitId: string;
    unitCode: string;
    isOpen: boolean;
    onClose: () => void
}) => {
    const { toast } = useToast();
    const { data: config, error, isLoading } = useGetUnitCpdConfigQuery(unitId, { skip: !isOpen });
    const [createConfig] = useCreateUnitCpdConfigMutation();
    const [updateConfig] = useUpdateUnitCpdConfigMutation();

    const [form, setForm] = useState({
        learning_objectives: "",
        learning_outcomes: "",
        estimated_minutes: 0,
        module_summary: "",
        accessibility_notes: ""
    });

    useEffect(() => {
        if (config) {
            setForm({
                learning_objectives: config.learning_objectives || "",
                learning_outcomes: config.learning_outcomes || "",
                estimated_minutes: config.estimated_minutes || 0,
                module_summary: config.module_summary || "",
                accessibility_notes: config.accessibility_notes || ""
            });
        }
    }, [config]);

    const handleSave = async () => {
        try {
            if (!config && error && (error as any).status === 404) {
                await createConfig({ unitId, payload: form }).unwrap();
            } else {
                await updateConfig({ unitId, payload: form }).unwrap();
            }
            toast({ title: "CPD settings saved" });
            onClose();
        } catch (err) {
            toast({ title: "Save failed", variant: "destructive" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        CPD Settings: {unitCode}
                    </DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Estimated Duration (min)</Label>
                                <Input
                                    type="number"
                                    value={form.estimated_minutes}
                                    onChange={e => setForm(f => ({ ...f, estimated_minutes: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Learning Objectives</Label>
                            <Textarea
                                value={form.learning_objectives}
                                onChange={e => setForm(f => ({ ...f, learning_objectives: e.target.value }))}
                                placeholder="What will learners achieve?"
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Learning Outcomes</Label>
                            <Textarea
                                value={form.learning_outcomes}
                                onChange={e => setForm(f => ({ ...f, learning_outcomes: e.target.value }))}
                                placeholder="Measurable results of this unit"
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Module Summary</Label>
                            <Textarea
                                value={form.module_summary}
                                onChange={e => setForm(f => ({ ...f, module_summary: e.target.value }))}
                                placeholder="A brief overview for the learner"
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Accessibility Notes</Label>
                            <Input
                                value={form.accessibility_notes}
                                onChange={e => setForm(f => ({ ...f, accessibility_notes: e.target.value }))}
                                placeholder="WCAG compliance, transcripts, etc."
                            />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" /> Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
