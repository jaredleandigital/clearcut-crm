"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";

interface LeadCardProps {
  lead: Doc<"leads">;
  onDragStart: () => void;
  onClick: () => void;
}

export function LeadCard({ lead, onDragStart, onClick }: LeadCardProps) {
  const daysInStage = lead.statusChangedAt
    ? Math.floor((Date.now() - lead.statusChangedAt) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-grab rounded-md border bg-background p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-tight">{lead.name}</h3>
        {daysInStage > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {daysInStage}d
          </span>
        )}
      </div>

      {lead.projectType && (
        <Badge variant="secondary" className="mt-1.5 text-xs">
          {lead.projectType}
        </Badge>
      )}

      <div className="mt-2 flex items-center justify-between">
        {lead.estimatedValue ? (
          <span className="text-xs font-medium text-green-600">
            ${lead.estimatedValue.toLocaleString()}
          </span>
        ) : (
          <span />
        )}
        {lead.source && (
          <span className="text-xs text-muted-foreground">{lead.source}</span>
        )}
      </div>
    </div>
  );
}
