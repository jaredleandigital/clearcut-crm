"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FollowUpFormProps {
  leadId: Id<"leads">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowUpForm({ leadId, open, onOpenChange }: FollowUpFormProps) {
  const createFollowUp = useMutation(api.followUps.create);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get("dueDate") as string;
    const timeStr = (formData.get("dueTime") as string) || "09:00";
    const dueAt = new Date(`${dateStr}T${timeStr}`).getTime();

    await createFollowUp({
      leadId,
      dueAt,
      note: (formData.get("note") as string) || undefined,
    });

    setLoading(false);
    onOpenChange(false);
  }

  // Default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Follow-up</DialogTitle>
          <DialogDescription>Schedule a reminder for this lead.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="due-date">Date *</Label>
              <Input
                id="due-date"
                name="dueDate"
                type="date"
                required
                defaultValue={defaultDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-time">Time</Label>
              <Input
                id="due-time"
                name="dueTime"
                type="time"
                defaultValue="09:00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="followup-note">Note</Label>
            <Textarea
              id="followup-note"
              name="note"
              placeholder="What to follow up on..."
              className="min-h-[60px]"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Set Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
