import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResourcePlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fileUrl: string;
  type: "video" | "audio";
}

const ResourcePlayerModal = ({
  open,
  onOpenChange,
  title,
  fileUrl,
  type,
}: ResourcePlayerModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[95vw] border-none p-0 overflow-hidden bg-background flex flex-col">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold truncate pr-8">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center bg-black min-h-[300px] h-[90vh]">
          {type === "video" ? (
            <video
              src={fileUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full p-10 bg-background">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary animate-ping" />
                </div>
              </div>
              <audio
                src={fileUrl}
                className="w-full max-w-md"
                controls
                autoPlay
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourcePlayerModal;
