import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Eye, Save, FileCheck, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  useGetAdminDeclarationTemplateQuery,
  useCreateAdminDeclarationTemplateMutation,
  useUpdateAdminDeclarationTemplateMutation,
  DeclarationTemplate,
  CheckboxItem,
} from "@/redux/apis/enrolmentDeclarationApi";
import { Loader2 } from "lucide-react";

// Removed localStorage helper functions

interface LearnerDeclarationEditorProps {
  qualificationId: string;
}

const LearnerDeclarationEditor = ({
  qualificationId,
}: LearnerDeclarationEditorProps) => {
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetAdminDeclarationTemplateQuery(qualificationId);
  const [createTemplate] = useCreateAdminDeclarationTemplateMutation();
  const [updateTemplate] = useUpdateAdminDeclarationTemplateMutation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [template, setTemplate] = useState<Partial<DeclarationTemplate>>({
    title: "Learner Declaration",
    body_text: "",
    checkbox_items: [],
    is_active: false,
  });

  useEffect(() => {
    if (apiResponse?.data) {
      setTemplate(apiResponse.data);
    }
  }, [apiResponse]);

  const [hasChanges, setHasChanges] = useState(false);

  const updateField = <K extends keyof DeclarationTemplate>(
    key: K,
    value: DeclarationTemplate[K],
  ) => {
    setTemplate((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const addCheckbox = () => {
    const newItem: CheckboxItem = {
      key: `item_${Date.now()}`,
      label: "",
    };
    updateField("checkbox_items", [
      ...(template.checkbox_items || []),
      newItem,
    ]);
  };

  const updateCheckboxLabel = (index: number, label: string) => {
    const updated = [...(template.checkbox_items || [])];
    updated[index] = { ...updated[index], label };
    updateField("checkbox_items", updated);
  };

  const updateCheckboxKey = (index: number, key: string) => {
    const sanitized = key.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
    const updated = [...(template.checkbox_items || [])];
    updated[index] = { ...updated[index], key: sanitized };
    updateField("checkbox_items", updated);
  };

  const removeCheckbox = (index: number) => {
    const updated = (template.checkbox_items || []).filter(
      (_, i) => i !== index,
    );
    updateField("checkbox_items", updated);
  };

  const handleSave = async () => {
    if (!template.title?.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!template.body_text?.trim()) {
      toast({
        title: "Declaration body text is required",
        variant: "destructive",
      });
      return;
    }
    if (!template.checkbox_items?.length) {
      toast({
        title: "At least one checkbox item is required",
        variant: "destructive",
      });
      return;
    }
    const emptyLabels = template.checkbox_items.some(
      (item) => !item.label.trim(),
    );
    if (emptyLabels) {
      toast({
        title: "All checkbox items must have a label",
        variant: "destructive",
      });
      return;
    }
    const keys = template.checkbox_items.map((item) => item.key);
    if (new Set(keys).size !== keys.length) {
      toast({ title: "Checkbox keys must be unique", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (apiResponse?.data) {
        // Update existing
        await updateTemplate({
          qualificationId,
          payload: {
            qualification: qualificationId,
            title: template.title,
            body_text: template.body_text,
            checkbox_items: template.checkbox_items,
            is_active: template.is_active,
          },
        }).unwrap();
        toast({ title: "Declaration template updated" });
      } else {
        // Create new
        await createTemplate({
          qualificationId,
          payload: {
            qualification: qualificationId,
            title: template.title,
            body_text: template.body_text,
            checkbox_items: template.checkbox_items,
            is_active: template.is_active,
          },
        }).unwrap();
        toast({ title: "Declaration template created" });
      }
      setHasChanges(false);
    } catch (err) {
      toast({
        title: "Failed to save template",
        description: "An error occurred while communicating with the server.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Loading declaration configuration...
        </p>
      </div>
    );
  }

  const isNotFoundError = (error as any)?.status === 404;

  if (error && !isNotFoundError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-destructive">
        <AlertTriangle className="w-8 h-8" />
        <p className="text-sm font-medium">Failed to load declaration configuration.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCheck className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Learner Declaration
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure the declaration learners must accept before
              qualification completion.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {template.version && (
            <Badge variant="outline" className="text-xs">
              v{template.version}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            disabled={(template.checkbox_items?.length || 0) === 0}
          >
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>

      <Separator />

      {/* Active Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Enable Declaration
            </p>
            <p className="text-xs text-muted-foreground">
              When enabled, learners must complete this declaration before
              qualification completion.
            </p>
          </div>
          <Switch
            checked={template.is_active}
            onCheckedChange={(checked) => updateField("is_active", checked)}
          />
        </div>
      </Card>

      {/* Title & Body */}
      <Card className="p-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Declaration Title *</Label>
          <Input
            value={template.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Learner Declaration"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Declaration Body Text *</Label>
          <Textarea
            value={template.body_text}
            onChange={(e) => updateField("body_text", e.target.value)}
            placeholder="Please read and confirm the statements below before completing your qualification."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            This text is displayed above the checkbox items.
          </p>
        </div>
      </Card>

      {/* Checkbox Items */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Checkbox Items
            </p>
            <p className="text-xs text-muted-foreground">
              Each item becomes a checkbox the learner must tick. Keys are used
              internally for submission tracking.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={addCheckbox}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>

        {!template.checkbox_items || template.checkbox_items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            No checkbox items yet. Click "Add Item" to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {template.checkbox_items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border"
              >
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <Label className="text-xs">Key</Label>
                      <Input
                        value={item.key}
                        onChange={(e) =>
                          updateCheckboxKey(index, e.target.value)
                        }
                        placeholder="e.g. own_work"
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">
                        Label (learner-facing) *
                      </Label>
                      <Input
                        value={item.label}
                        onChange={(e) =>
                          updateCheckboxLabel(index, e.target.value)
                        }
                        placeholder="e.g. I confirm this is my own work"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive mt-5"
                  onClick={() => removeCheckbox(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Declaration Preview (Learner View)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-bold text-foreground">
              {template.title}
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {template.body_text}
            </p>
            <Separator />
            <div className="space-y-3">
              {template.checkbox_items?.map((item) => (
                <div key={item.key} className="flex items-start gap-3">
                  <Checkbox id={`preview-${item.key}`} disabled />
                  <label
                    htmlFor={`preview-${item.key}`}
                    className="text-sm text-foreground leading-tight cursor-pointer"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-sm">Full Name (typed signature)</Label>
              <Input
                disabled
                placeholder="Learner types their full name here"
              />
            </div>
            <Button disabled className="w-full">
              Submit Declaration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearnerDeclarationEditor;
