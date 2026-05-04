"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { STAGE_CONFIG, PipelineStage } from "@/lib/types";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ArrowRightLeft,
  MoreHorizontal,
} from "lucide-react";

const typeIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  site_visit: MapPin,
  note: MessageSquare,
  status_change: ArrowRightLeft,
  other: MoreHorizontal,
};

const typeLabels: Record<string, string> = {
  call: "Call",
  email: "Email",
  site_visit: "Site Visit",
  note: "Note",
  status_change: "Status Change",
  other: "Other",
};

interface ActivityTimelineProps {
  leadId: Id<"leads">;
}

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const activities = useQuery(api.activities.listByLead, { leadId });

  if (activities === undefined) {
    return (
      <div className="text-xs text-muted-foreground">Loading activities...</div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No activity logged yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = typeIcons[activity.type] || MoreHorizontal;
        return (
          <div key={activity._id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="w-px flex-1 bg-border" />
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{activity.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
              {activity.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activity.description}
                </p>
              )}
              {activity.metadata?.oldStatus && activity.metadata?.newStatus && (
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span
                    className="rounded px-1.5 py-0.5"
                    style={{
                      backgroundColor:
                        (STAGE_CONFIG[activity.metadata.oldStatus as PipelineStage]
                          ?.color ?? "#888") + "20",
                      color:
                        STAGE_CONFIG[activity.metadata.oldStatus as PipelineStage]
                          ?.color ?? "#888",
                    }}
                  >
                    {STAGE_CONFIG[activity.metadata.oldStatus as PipelineStage]
                      ?.label ?? activity.metadata.oldStatus}
                  </span>
                  <span className="text-muted-foreground">&rarr;</span>
                  <span
                    className="rounded px-1.5 py-0.5"
                    style={{
                      backgroundColor:
                        (STAGE_CONFIG[activity.metadata.newStatus as PipelineStage]
                          ?.color ?? "#888") + "20",
                      color:
                        STAGE_CONFIG[activity.metadata.newStatus as PipelineStage]
                          ?.color ?? "#888",
                    }}
                  >
                    {STAGE_CONFIG[activity.metadata.newStatus as PipelineStage]
                      ?.label ?? activity.metadata.newStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
