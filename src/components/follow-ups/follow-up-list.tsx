"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Clock } from "lucide-react";

interface FollowUpListProps {
  leadId: Id<"leads">;
}

export function FollowUpList({ leadId }: FollowUpListProps) {
  const followUps = useQuery(api.followUps.listByLead, { leadId });
  const markComplete = useMutation(api.followUps.markComplete);
  const removeFollowUp = useMutation(api.followUps.remove);

  if (followUps === undefined) {
    return (
      <div className="text-xs text-muted-foreground">Loading follow-ups...</div>
    );
  }

  if (followUps.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No follow-ups scheduled.</p>
    );
  }

  const now = Date.now();

  return (
    <div className="space-y-2">
      {followUps.map((fu) => {
        const isOverdue = !fu.completed && fu.dueAt < now;
        const dateStr = new Date(fu.dueAt).toLocaleDateString();
        const timeStr = new Date(fu.dueAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={fu._id}
            className={`flex items-start gap-2 rounded-md border p-2 text-sm ${
              fu.completed
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                : isOverdue
                  ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950"
                  : "border-border"
            }`}
          >
            <Clock
              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                fu.completed
                  ? "text-green-600"
                  : isOverdue
                    ? "text-red-500"
                    : "text-muted-foreground"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-medium ${
                    isOverdue && !fu.completed ? "text-red-600" : ""
                  }`}
                >
                  {dateStr} {timeStr}
                </span>
                {fu.completed && (
                  <span className="text-xs text-green-600">Done</span>
                )}
                {isOverdue && !fu.completed && (
                  <span className="text-xs text-red-500 font-medium">Overdue</span>
                )}
              </div>
              {fu.note && (
                <p className="mt-0.5 text-xs text-muted-foreground">{fu.note}</p>
              )}
            </div>
            {!fu.completed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => markComplete({ id: fu._id })}
                title="Mark complete"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => removeFollowUp({ id: fu._id })}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
