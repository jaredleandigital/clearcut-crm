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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTIVITY_TYPES = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "site_visit", label: "Site Visit" },
  { value: "note", label: "Note" },
  { value: "other", label: "Other" },
];

interface ActivityFormProps {
  leadId: Id<"leads">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityForm({ leadId, open, onOpenChange }: ActivityFormProps) {
  const createActivity = useMutation(api.activities.create);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("note");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    await createActivity({
      leadId,
      type,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
    });

    setLoading(false);
    setType("note");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>Record an interaction with this lead.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-title">Title *</Label>
            <Input
              id="activity-title"
              name="title"
              required
              placeholder="e.g. Called to discuss quote"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-description">Details</Label>
            <Textarea
              id="activity-description"
              name="description"
              placeholder="Optional notes..."
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
              {loading ? "Saving..." : "Log Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
