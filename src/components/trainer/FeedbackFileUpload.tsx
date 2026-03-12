import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FeedbackFileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const FeedbackFileUpload = ({ files, onChange }: FeedbackFileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange([...files, ...newFiles]);
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Feedback Attachments (optional)
      </label>
      <div className="flex flex-wrap gap-2 mt-1">
        {files.map((file, i) => (
          <Badge key={i} variant="secondary" className="gap-1.5 pr-1 text-xs">
            <FileText className="w-3 h-3" />
            {file.name}
            <button onClick={() => removeFile(i)} className="ml-1 hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
        <Upload className="w-4 h-4" />
        Attach feedback file
        <input
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.txt,.png,.jpg"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default FeedbackFileUpload;
