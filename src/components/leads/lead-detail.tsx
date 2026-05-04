"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import {
  PIPELINE_STAGES,
  STAGE_CONFIG,
  PROJECT_TYPES,
  LEAD_SOURCES,
  PipelineStage,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Trash2, Plus, Clock, AlertTriangle } from "lucide-react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { ActivityForm } from "@/components/activities/activity-form";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";
import { FollowUpList } from "@/components/follow-ups/follow-up-list";

interface LeadDetailProps {
  leadId: Id<"leads">;
  onClose: () => void;
}

export function LeadDetail({ leadId, onClose }: LeadDetailProps) {
  const lead = useQuery(api.leads.get, { id: leadId });
  const updateLead = useMutation(api.leads.update);
  const updateStatus = useMutation(api.leads.updateStatus);
  const removeLead = useMutation(api.leads.remove);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);

  if (!lead) {
    return null;
  }

  const stageConfig = STAGE_CONFIG[lead.status as PipelineStage];
  const daysInStage = lead.statusChangedAt
    ? Math.floor((Date.now() - lead.statusChangedAt) / (1000 * 60 * 60 * 24))
    : 0;

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const estimatedValue = formData.get("estimatedValue") as string;

    await updateLead({
      id: leadId,
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      projectType: (formData.get("projectType") as string) || undefined,
      projectAddress: (formData.get("projectAddress") as string) || undefined,
      projectDescription:
        (formData.get("projectDescription") as string) || undefined,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      source: (formData.get("source") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });

    setSaving(false);
    setEditing(false);
  }

  async function handleStatusChange(newStatus: string) {
    await updateStatus({ id: leadId, status: newStatus });
  }

  async function handleDelete() {
    await removeLead({ id: leadId });
    setShowDeleteDialog(false);
    onClose();
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full border-l bg-background shadow-lg md:max-w-md">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-semibold truncate">{lead.name}</h2>
            <Badge
              style={{
                backgroundColor: stageConfig?.color + "20",
                color: stageConfig?.color,
                borderColor: stageConfig?.color + "40",
              }}
            >
              {stageConfig?.label}
            </Badge>
            {lead.isDuplicate && (
              <Badge variant="destructive" className="text-xs">
                Duplicate
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Duplicate warning */}
          {lead.isDuplicate && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Potential Duplicate
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  This lead may already exist. Check for matching email or phone.
                </p>
              </div>
            </div>
          )}

          {/* Status selector */}
          <div className="mb-6 space-y-2">
            <Label>Pipeline Stage</Label>
            <Select
              value={lead.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {STAGE_CONFIG[stage].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {daysInStage} day{daysInStage !== 1 ? "s" : ""} in current stage
            </p>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={lead.name}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={lead.email ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    defaultValue={lead.phone ?? ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select
                  name="projectType"
                  defaultValue={lead.projectType ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Project Address</Label>
                <Input
                  id="edit-address"
                  name="projectAddress"
                  defaultValue={lead.projectAddress ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  name="projectDescription"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={lead.projectDescription ?? ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Estimated Value ($)</Label>
                  <Input
                    id="edit-value"
                    name="estimatedValue"
                    type="number"
                    defaultValue={lead.estimatedValue ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select name="source" defaultValue={lead.source ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={lead.notes ?? ""}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} size="sm">
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Contact info */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Contact
                </h3>
                <dl className="space-y-1 text-sm">
                  {lead.email && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {lead.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {lead.source && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Source</dt>
                      <dd>{lead.source}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Project info */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Project
                </h3>
                <dl className="space-y-1 text-sm">
                  {lead.projectType && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd>{lead.projectType}</dd>
                    </div>
                  )}
                  {lead.projectAddress && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Address</dt>
                      <dd className="text-right">{lead.projectAddress}</dd>
                    </div>
                  )}
                  {lead.estimatedValue && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Value</dt>
                      <dd className="font-medium text-green-600">
                        ${lead.estimatedValue.toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>
                {lead.projectDescription && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {lead.projectDescription}
                  </p>
                )}
              </div>

              {/* Notes */}
              {lead.notes && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Notes
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}

              {/* Follow-ups */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Follow-ups
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setShowFollowUpForm(true)}
                  >
                    <Clock className="h-3 w-3" />
                    Set Reminder
                  </Button>
                </div>
                <FollowUpList leadId={leadId} />
              </div>

              {/* Activity Timeline */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Activity
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setShowActivityForm(true)}
                  >
                    <Plus className="h-3 w-3" />
                    Log Activity
                  </Button>
                </div>
                <ActivityTimeline leadId={leadId} />
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Timeline
                </h3>
                <dl className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <dt>Created</dt>
                    <dd>{new Date(lead.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Updated</dt>
                    <dd>{new Date(lead.updatedAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>

              {/* Lost reason */}
              {lead.status === "closed_lost" && lead.lostReason && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-destructive">
                    Lost Reason
                  </h3>
                  <p className="text-sm">{lead.lostReason}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        leadName={lead.name}
        onConfirm={handleDelete}
      />
      <ActivityForm
        leadId={leadId}
        open={showActivityForm}
        onOpenChange={setShowActivityForm}
      />
      <FollowUpForm
        leadId={leadId}
        open={showFollowUpForm}
        onOpenChange={setShowFollowUpForm}
      />
    </div>
  );
}
