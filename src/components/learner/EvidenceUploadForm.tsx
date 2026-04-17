import { useState, useRef } from "react";
import { Upload, FileText, X, Link2, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { generateEvidenceNumber } from "@/lib/evidenceNumbering";
import { useSubmitEvidenceMutation } from "@/redux/apis/enrolmentApi";

interface EvidenceUploadFormProps {
  requirements: string[] | string | Record<string, unknown> | null | undefined;
  enrolmentId: string;
  unitId: string;
  onSuccess?: () => void;
  isLocked?: boolean;
}

const ALLOWED_EVIDENCE_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".rtf",
  ".txt",
  ".csv",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
  ".m4v",
  ".wmv",
]);

const EVIDENCE_ACCEPT_ATTR = Array.from(ALLOWED_EVIDENCE_EXTENSIONS).join(",");

const normalizeRequirements = (
  requirements: EvidenceUploadFormProps["requirements"]
): string[] => {
  if (Array.isArray(requirements)) {
    return requirements.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof requirements === "string") {
    return requirements
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (requirements && typeof requirements === "object") {
    return Object.values(requirements)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return [];
};

const getExtension = (fileName: string) => {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
};

const EvidenceUploadForm = ({ requirements, enrolmentId, unitId, onSuccess, isLocked }: EvidenceUploadFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [linkedCriteria, setLinkedCriteria] = useState<string[]>([]);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const normalizedRequirements = normalizeRequirements(requirements);

  const [submitEvidence, { isLoading: isSubmitting }] = useSubmitEvidenceMutation();

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

    const incomingFiles = Array.from(fileList);
    const validFiles = incomingFiles.filter((file) => ALLOWED_EVIDENCE_EXTENSIONS.has(getExtension(file.name)));
    const invalidFiles = incomingFiles.filter((file) => !ALLOWED_EVIDENCE_EXTENSIONS.has(getExtension(file.name)));

    if (invalidFiles.length > 0) {
      toast({
        title: "Some files were not added",
        description: `Unsupported file type: ${invalidFiles.map((file) => file.name).join(", ")}`,
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const toggleCriteria = (criterion: string) => {
    setLinkedCriteria((prev) =>
      prev.includes(criterion) ? prev.filter((c) => c !== criterion) : [...prev, criterion]
    );
  };

  const handleSubmit = async () => {
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

    try {
      const formData = new FormData();
      formData.append("description", description);
      linkedCriteria.forEach((criterion) => formData.append("criteria_ids", criterion));
      files.forEach((file) => formData.append("files", file));

      await submitEvidence({ enrolmentId, unitId, body: formData }).unwrap();

      setFiles([]);
      setDescription("");
      setLinkedCriteria([]);
      setDeclarationChecked(false);

      toast({
        title: "Evidence Submitted",
        description: "Your evidence has been uploaded and submitted for assessment.",
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      const description =
        err?.data?.files ||
        err?.data?.criteria_ids ||
        err?.data?.description ||
        err?.data?.detail ||
        err?.data?.message ||
        "Failed to upload evidence";
      toast({
        title: "Submission failed",
        description: Array.isArray(description) ? description[0] : description,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-base font-bold text-primary mb-1">Upload Evidence</h3>
      <p className="text-sm text-muted-foreground mb-5">Upload your completed evidence with a description and link to assessment criteria</p>

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
            <p className="text-xs text-muted-foreground mt-1">
              PDF, Word, Excel, PowerPoint, image, audio, or video files (max. 10MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={EVIDENCE_ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {files.length > 0 && (
            <div className="space-y-2 mt-3">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`}</span>
                  <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

        <div>
          <Label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            Link to Assessment Criteria <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-2 mt-2">
            {normalizedRequirements.map((req) => {
              const criterionId = req;
              const checked = linkedCriteria.includes(criterionId);
              return (
                <label
                  key={criterionId}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleCriteria(criterionId)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-primary">{criterionId}</span>
                  </div>
                </label>
              );
            })}
            {normalizedRequirements.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                No assessment criteria are available for this unit yet.
              </div>
            )}
          </div>
        </div>

        <div className="border border-primary/20 bg-primary/5 rounded-xl p-4">
          <div className="flex items-start gap-3">

            <div className="flex-1">

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={declarationChecked}
                  onCheckedChange={(checked) => setDeclarationChecked(checked === true)}
                  className="mt-0.5"
                  aria-label="I confirm this is my own work"
                />
                <p className="text-sm text-muted-foreground">
                  I declare that this assignment is my own original work and has been completed without any unauthorised assistance. I acknowledge that submitting work that is not my own may lead to disciplinary action.
                </p>
              </label>
            </div>
          </div>
        </div>

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
          <Button onClick={handleSubmit} disabled={!declarationChecked || isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isSubmitting ? "Submitting..." : "Submit Evidence"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploadForm;
