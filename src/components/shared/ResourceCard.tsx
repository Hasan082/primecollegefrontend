import React from "react";
import { Download, Play, ExternalLink, FileText, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearnerUnitOverviewResource } from "@/types/enrollment.types";

interface ResourceCardProps {
  resource: LearnerUnitOverviewResource;
  onPlay: (resource: LearnerUnitOverviewResource, type: "video" | "audio") => void;
}

const getFileType = (filename: string) => {
  const extension = filename.split(".").pop()?.toUpperCase();
  if (!extension || extension === filename.toUpperCase()) return "FILE";
  return extension;
};

const getMediaInfo = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();

  const videoExtensions = ["mp4", "webm", "ogg", "mov", "mkv"];
  const audioExtensions = ["mp3", "wav", "aac", "m4a"];

  if (extension && videoExtensions.includes(extension)) {
    return { isMedia: true, type: "video" as const };
  }
  if (extension && audioExtensions.includes(extension)) {
    return { isMedia: true, type: "audio" as const };
  }

  return { isMedia: false, type: null };
};

const ResourceCard = ({ resource, onPlay }: ResourceCardProps) => {
  const { isMedia, type } = getMediaInfo(resource.file || resource.title);
  const fileType = getFileType(resource.title);

  const renderIcon = () => {
    if (type === "video") return <Video className="w-5 h-5 text-primary flex-shrink-0" />;
    if (type === "audio") return <Music className="w-5 h-5 text-primary flex-shrink-0" />;
    return <FileText className="w-5 h-5 text-primary flex-shrink-0" />;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-border rounded-xl bg-card hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
          {renderIcon()}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {resource.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {fileType}
            </span>
            {resource.estimated_minutes > 0 && (
              <span className="text-xs text-muted-foreground italic">
                • {resource.estimated_minutes} mins
              </span>
            )}
            {resource.is_required && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                Required
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
        {resource.external_url && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            asChild
          >
            <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />

            </a>
          </Button>
        )}

        {isMedia ? (
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1.5 text-xs shadow-none"
            onClick={() => type && onPlay(resource, type)}
          >
            <Play className="w-3.5 h-3.5 fill-current" />

          </Button>
        ) : (
          resource.file && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs hover:bg-primary hover:text-primary-foreground transition-all"
              asChild
            >
              <a href={resource.file} download>
                <Download className="w-3.5 h-3.5" />

              </a>
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default ResourceCard;
