"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef } from "react";
import { PIPELINE_STAGES, STAGE_CONFIG, PipelineStage } from "@/lib/types";
import { LeadCard } from "./lead-card";
import { LeadForm } from "./lead-form";
import { LeadDetail } from "./lead-detail";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function LeadPipeline() {
  const leads = useQuery(api.leads.list);
  const updateStatus = useMutation(api.leads.updateStatus);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Id<"crmLeads"> | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const draggedLeadRef = useRef<Id<"crmLeads"> | null>(null);

  if (leads === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading pipeline...</div>
      </div>
    );
  }

  const leadsByStatus = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = leads.filter((l) => l.status === stage);
      return acc;
    },
    {} as Record<PipelineStage, typeof leads>
  );

  function handleDragStart(leadId: Id<"crmLeads">) {
    draggedLeadRef.current = leadId;
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    setDragOverStage(stage);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  async function handleDrop(stage: string) {
    setDragOverStage(null);
    const leadId = draggedLeadRef.current;
    if (!leadId) return;
    draggedLeadRef.current = null;

    await updateStatus({ id: leadId, status: stage });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} in pipeline
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const config = STAGE_CONFIG[stage];
          const stageLeads = leadsByStatus[stage];

          return (
            <div
              key={stage}
              className="flex min-w-[280px] flex-col rounded-lg bg-muted/50"
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-medium">{config.label}</span>
                <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div
                className={`flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 transition-colors ${
                  dragOverStage === stage ? "bg-accent/50 rounded-b-lg" : ""
                }`}
              >
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead._id}
                    lead={lead}
                    onDragStart={() => handleDragStart(lead._id)}
                    onClick={() => setSelectedLead(lead._id)}
                  />
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Dialog */}
      <LeadForm open={showAddForm} onOpenChange={setShowAddForm} />

      {/* Lead Detail Panel */}
      {selectedLead && (
        <LeadDetail
          leadId={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
