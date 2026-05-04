"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, Clock, AlertTriangle } from "lucide-react";
import { STAGE_CONFIG, PipelineStage } from "@/lib/types";
import Link from "next/link";

function FollowUpsContent() {
  const followUps = useQuery(api.followUps.listAll);
  const markComplete = useMutation(api.followUps.markComplete);
  const removeFollowUp = useMutation(api.followUps.remove);

  if (followUps === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading follow-ups...</div>
      </div>
    );
  }

  const now = Date.now();
  const overdue = followUps.filter((fu) => fu.dueAt < now);
  const upcoming = followUps.filter((fu) => fu.dueAt >= now);

  return (
    <div className="space-y-6">
      {/* Overdue */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h2 className="text-lg font-semibold">
            Overdue ({overdue.length})
          </h2>
        </div>
        {overdue.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No overdue follow-ups. Nice work!
          </p>
        ) : (
          <div className="space-y-2">
            {overdue.map((fu) => (
              <FollowUpCard
                key={fu._id}
                fu={fu}
                isOverdue
                onComplete={() => markComplete({ id: fu._id })}
                onDelete={() => removeFollowUp({ id: fu._id })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            Upcoming ({upcoming.length})
          </h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming follow-ups scheduled.
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((fu) => (
              <FollowUpCard
                key={fu._id}
                fu={fu}
                isOverdue={false}
                onComplete={() => markComplete({ id: fu._id })}
                onDelete={() => removeFollowUp({ id: fu._id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FollowUpCard({
  fu,
  isOverdue,
  onComplete,
  onDelete,
}: {
  fu: {
    _id: string;
    dueAt: number;
    note?: string;
    leadName: string;
    leadStatus: string;
  };
  isOverdue: boolean;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const stageConfig = STAGE_CONFIG[fu.leadStatus as PipelineStage];
  const dateStr = new Date(fu.dueAt).toLocaleDateString();
  const timeStr = new Date(fu.dueAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Days overdue
  const daysOverdue = isOverdue
    ? Math.floor((Date.now() - fu.dueAt) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        isOverdue
          ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950"
          : "border-border bg-background"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href="/leads"
            className="text-sm font-medium hover:underline"
          >
            {fu.leadName}
          </Link>
          {stageConfig && (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: stageConfig.color + "60",
                color: stageConfig.color,
              }}
            >
              {stageConfig.label}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {dateStr} {timeStr}
          </span>
          {isOverdue && daysOverdue > 0 && (
            <span className="font-medium text-red-500">
              {daysOverdue}d overdue
            </span>
          )}
        </div>
        {fu.note && (
          <p className="mt-1 text-sm text-muted-foreground">{fu.note}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onComplete}
          title="Mark complete"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function FollowUpsPage() {
  return (
    <>
      <SignedIn>
        <FollowUpsContent />
      </SignedIn>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Sign in to view follow-ups</h2>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
