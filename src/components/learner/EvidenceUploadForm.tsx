import { useState, useRef } from "react";
import { Upload, FileText, X, Link2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { generateEvidenceNumber } from "@/lib/evidenceNumbering";

interface EvidenceUploadFormProps {
  requirements: string[];
  onSubmit: (data: {
    files: { name: string; size: string }[];
    description: string;
    linkedCriteria: string[];
    evidenceRef: string;
  }) => void;
  isLocked?: boolean;
}

const EvidenceUploadForm = ({ requirements, onSubmit, isLocked }: EvidenceUploadFormProps) => {
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [description, setDescription] = useState("");
  const [linkedCriteria, setLinkedCriteria] = useState<string[]>([]);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (isLocked) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🔒</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Evidence Upload Locked</p>
            <p className="text-xs text-muted-foreground">Complete enrolment and payment to upload evidence</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const toggleCriteria = (criterion: string) => {
    setLinkedCriteria((prev) =>
      prev.includes(criterion) ? prev.filter((c) => c !== criterion) : [...prev, criterion]
    );
  };

  const handleSubmit = () => {
    if (!files.length) {
      toast({ title: "Please upload at least one file", variant: "destructive" });
      return;
    }
    if (!description.trim()) {
      toast({ title: "Please provide an evidence description", variant: "destructive" });
      return;
    }
    if (!linkedCriteria.length) {
      toast({ title: "Please link at least one assessment criterion", variant: "destructive" });
      return;
    }
    if (!declarationChecked) {
      toast({ title: "Please confirm the Learner Declaration", variant: "destructive" });
      return;
    }

    const evidenceRef = generateEvidenceNumber();
    onSubmit({ files, description, linkedCriteria, evidenceRef });

    // Reset form
    setFiles([]);
    setDescription("");
    setLinkedCriteria([]);
    setDeclarationChecked(false);
    toast({
      title: "Evidence Submitted",
      description: `Reference: ${evidenceRef} — Your evidence has been submitted for assessment.`,
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-base font-bold text-primary mb-1">Upload Evidence</h3>
      <p className="text-sm text-muted-foreground mb-5">Upload your completed evidence with a description and link to assessment criteria</p>

      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold mb-2 block">Files</Label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">
              <span className="text-primary font-medium underline">Click to upload</span>{" "}
              <span className="text-muted-foreground">or drag and drop</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, images (max. 10MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.doc,.xls,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {files.length > 0 && (
            <div className="space-y-2 mt-3">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.size}</span>
                  <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evidence Description */}
        <div>
          <Label htmlFor="evidence-desc" className="text-sm font-semibold mb-2 block">
            Evidence Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="evidence-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you have uploaded and how it demonstrates your competence..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1">Explain how this evidence meets the assessment criteria</p>
        </div>

        {/* Link to Criteria */}
        <div>
          <Label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            Link to Assessment Criteria <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-2 mt-2">
            {requirements.map((req, i) => {
              const criterionId = `AC ${i + 1}.1`;
              const checked = linkedCriteria.includes(criterionId);
              return (
                <label
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleCriteria(criterionId)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-primary">{criterionId}</span>
                    <p className="text-sm text-foreground">{req}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Learner Declaration */}
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-2">Learner Declaration</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={declarationChecked}
                  onCheckedChange={(checked) => setDeclarationChecked(checked === true)}
                  className="mt-0.5"
                  aria-label="I confirm this is my own work"
                />
                <p className="text-sm text-muted-foreground">
                  I confirm that the evidence submitted is entirely my own work, produced without unauthorised assistance. I understand that submitting work that is not my own may result in disciplinary action.
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {linkedCriteria.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {linkedCriteria.map((c) => (
                  <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleSubmit} disabled={!declarationChecked} className="gap-2">
            <Upload className="w-4 h-4" /> Submit Evidence
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploadForm;
