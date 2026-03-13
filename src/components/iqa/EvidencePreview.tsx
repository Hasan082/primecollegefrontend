import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Image, FileSpreadsheet, Presentation, Download, Eye, X } from "lucide-react";
import { getDemoEvidenceNumber } from "@/lib/evidenceNumbering";

interface EvidencePreviewProps {
  files: string[];
  sampleId: string;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return <FileText className="w-4 h-4 text-red-500" />;
    case "jpg": case "jpeg": case "png": return <Image className="w-4 h-4 text-blue-500" />;
    case "xlsx": case "xls": case "csv": return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    case "pptx": case "ppt": return <Presentation className="w-4 h-4 text-orange-500" />;
    default: return <FileText className="w-4 h-4 text-muted-foreground" />;
  }
};

const getFileType = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "PDF Document";
    case "docx": case "doc": return "Word Document";
    case "jpg": case "jpeg": case "png": return "Image";
    case "xlsx": case "xls": return "Spreadsheet";
    case "pptx": case "ppt": return "Presentation";
    case "mp4": return "Video";
    default: return "Document";
  }
};

// Demo preview content based on file type
const getPreviewContent = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "docx" || ext === "doc") {
    return (
      <div className="bg-muted/30 rounded-lg p-6 min-h-[400px] space-y-4">
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg text-foreground">{filename}</h3>
          <p className="text-xs text-muted-foreground mt-1">Document Preview (Demo)</p>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="leading-relaxed">This is a preview of the submitted evidence document. In the production system, the actual document content would render here via the document viewer.</p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-xs font-semibold text-primary mb-1">Document Metadata</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span>Format: {ext?.toUpperCase()}</span>
              <span>Pages: 3</span>
              <span>Size: 245 KB</span>
              <span>Uploaded: 2026-02-10</span>
            </div>
          </div>
          <p className="leading-relaxed">The learner's evidence would be displayed inline, allowing the IQA to review without downloading. Annotations and highlighting would be supported for detailed review.</p>
        </div>
      </div>
    );
  }
  if (ext === "pptx" || ext === "ppt") {
    return (
      <div className="bg-muted/30 rounded-lg p-6 min-h-[400px] space-y-4">
        <div className="border-b pb-4 flex items-center gap-3">
          <Presentation className="w-6 h-6 text-orange-500" />
          <div>
            <h3 className="font-semibold text-lg text-foreground">{filename}</h3>
            <p className="text-xs text-muted-foreground">Slide Presentation Preview</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(slide => (
            <div key={slide} className="border rounded-lg bg-background p-4 aspect-video flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Slide {slide}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">Preview thumbnail</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-muted/30 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
      <div className="text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">{filename}</p>
        <p className="text-xs text-muted-foreground mt-1">Preview available after download</p>
      </div>
    </div>
  );
};

const EvidencePreview = ({ files, sampleId }: EvidencePreviewProps) => {
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  if (files.length === 0) return null;

  return (
    <>
      <div className="space-y-2">
        {files.map((f, i) => {
          const evRef = getDemoEvidenceNumber(sampleId, i);
          return (
            <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/30">
              {getFileIcon(f)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{f}</span>
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-mono shrink-0">
                    {evRef}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{getFileType(f)}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => setPreviewFile(f)}
                >
                  <Eye className="w-3 h-3" /> Preview
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <Download className="w-3 h-3" /> Download
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {previewFile && getFileIcon(previewFile)}
              {previewFile}
              {previewFile && (
                <Badge className="bg-primary text-primary-foreground text-[10px] font-mono">
                  {getDemoEvidenceNumber(sampleId, files.indexOf(previewFile!))}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewFile && getPreviewContent(previewFile)}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EvidencePreview;
