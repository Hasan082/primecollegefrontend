import React, { useState } from "react";
import ResourceCard from "./ResourceCard";
import ResourcePlayerModal from "./ResourcePlayerModal";
import { LearnerUnitOverviewResource } from "@/types/enrollment.types";

interface ResourceSectionProps {
  resources: LearnerUnitOverviewResource[];
  title?: string;
  description?: string;
}

const ResourceSection = ({
  resources,
  title = "Downloadable Resources",
  description = "Access unit specifications, templates, and guidance materials.",
}: ResourceSectionProps) => {
  const [playerState, setPlayerState] = useState<{
    open: boolean;
    resource: LearnerUnitOverviewResource | null;
    type: "video" | "audio" | null;
  }>({
    open: false,
    resource: null,
    type: null,
  });

  const handlePlay = (resource: LearnerUnitOverviewResource, type: "video" | "audio") => {
    setPlayerState({
      open: true,
      resource,
      type,
    });
  };

  const closePlayer = () => {
    setPlayerState((prev) => ({ ...prev, open: false }));
  };

  if (!resources || resources.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-base font-bold text-primary mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>
      
      <div className="space-y-3">
        {resources
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onPlay={handlePlay}
            />
          ))}
      </div>

      {playerState.resource && playerState.type && (
        <ResourcePlayerModal
          open={playerState.open}
          onOpenChange={closePlayer}
          title={playerState.resource.title}
          fileUrl={playerState.resource.file}
          type={playerState.type}
        />
      )}
    </div>
  );
};

export default ResourceSection;
