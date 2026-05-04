"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, AlertTriangle } from "lucide-react";

interface LeadCardProps {
  lead: Doc<"leads">;
  onDragStart: () => void;
  onClick: () => void;
}

export function LeadCard({ lead, onDragStart, onClick }: LeadCardProps) {
  const followUps = useQuery(api.followUps.listByLead, { leadId: lead._id });

  const daysInStage = lead.statusChangedAt
    ? Math.floor((Date.now() - lead.statusChangedAt) / (1000 * 60 * 60 * 24))
    : 0;

  // Stale lead detection (not for closed stages)
  const isClosed =
    lead.status === "closed_won" || lead.status === "closed_lost";
  const isStaleWarning = !isClosed && daysInStage >= 7 && daysInStage < 14;
  const isStaleCritical = !isClosed && daysInStage >= 14;

  // Overdue follow-up detection
  const now = Date.now();
  const hasOverdueFollowUp =
    followUps?.some((fu) => !fu.completed && fu.dueAt < now) ?? false;

  const borderClass = isStaleCritical
    ? "border-red-400 dark:border-red-600"
    : isStaleWarning
      ? "border-yellow-400 dark:border-yellow-500"
      : "border-border";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`cursor-grab rounded-md border-2 bg-background p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-sm font-medium leading-tight truncate">{lead.name}</h3>
          {hasOverdueFollowUp && (
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500"
              title="Overdue follow-up"
            />
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {lead.isDuplicate && (
            <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
              DUP
            </Badge>
          )}
          {daysInStage > 0 && (
            <span
              className={`text-xs ${
                isStaleCritical
                  ? "font-medium text-red-500"
                  : isStaleWarning
                    ? "font-medium text-yellow-600"
                    : "text-muted-foreground"
              }`}
            >
              {daysInStage}d
            </span>
          )}
        </div>
      </div>

      {lead.projectType && (
        <Badge variant="secondary" className="mt-1.5 text-xs">
          {lead.projectType}
        </Badge>
      )}

      {lead.phone && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            title="Call"
          >
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </a>
        </div>
      )}

      {lead.email && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            title="Email"
          >
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </a>
        </div>
      )}

      {lead.estimatedValue && (
        <div className="mt-2 text-xs font-medium text-green-600">
          ${lead.estimatedValue.toLocaleString()}
        </div>
      )}
    </div>
  );
}
