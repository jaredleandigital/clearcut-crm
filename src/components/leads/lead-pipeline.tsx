"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef, useCallback } from "react";
import { PIPELINE_STAGES, STAGE_CONFIG, PipelineStage } from "@/lib/types";
import { LeadCard } from "./lead-card";
import { LeadForm } from "./lead-form";
import { LeadDetail } from "./lead-detail";
import { SearchFiltersBar, SearchFilters } from "./search-filters";
import { Button } from "@/components/ui/button";
import { Plus, Download, AlertTriangle } from "lucide-react";

export function LeadPipeline() {
  const leads = useQuery(api.leads.list);
  const exportData = useQuery(api.export.exportLeads);
  const updateStatus = useMutation(api.leads.updateStatus);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Id<"leads"> | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const draggedLeadRef = useRef<Id<"leads"> | null>(null);
  const [showStaleOnly, setShowStaleOnly] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchText: "",
    projectType: "",
    source: "",
    status: "",
  });

  if (leads === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading pipeline...</div>
      </div>
    );
  }

  // Apply client-side filtering
  let filteredLeads = leads;

  if (filters.searchText) {
    const q = filters.searchText.toLowerCase();
    filteredLeads = filteredLeads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q))
    );
  }
  if (filters.projectType) {
    filteredLeads = filteredLeads.filter(
      (l) => l.projectType === filters.projectType
    );
  }
  if (filters.source) {
    filteredLeads = filteredLeads.filter((l) => l.source === filters.source);
  }
  if (filters.status) {
    filteredLeads = filteredLeads.filter((l) => l.status === filters.status);
  }
  if (showStaleOnly) {
    const now = Date.now();
    filteredLeads = filteredLeads.filter((l) => {
      if (l.status === "closed_won" || l.status === "closed_lost") return false;
      const days = l.statusChangedAt
        ? Math.floor((now - l.statusChangedAt) / (1000 * 60 * 60 * 24))
        : 0;
      return days >= 7;
    });
  }

  const leadsByStatus = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = filteredLeads.filter((l) => l.status === stage);
      return acc;
    },
    {} as Record<PipelineStage, typeof filteredLeads>
  );

  function handleDragStart(leadId: Id<"leads">) {
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

  function handleExportCSV() {
    if (!exportData || exportData.length === 0) return;

    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(","),
      ...exportData.map((row) =>
        headers
          .map((h) => {
            const val = String((row as Record<string, unknown>)[h] ?? "");
            // Escape commas and quotes
            if (val.includes(",") || val.includes('"') || val.includes("\n")) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clearcut-leads-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const staleCount = leads.filter((l) => {
    if (l.status === "closed_won" || l.status === "closed_lost") return false;
    const days = l.statusChangedAt
      ? Math.floor((Date.now() - l.statusChangedAt) / (1000 * 60 * 60 * 24))
      : 0;
    return days >= 7;
  }).length;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Search & Filters */}
      <SearchFiltersBar filters={filters} onFiltersChange={setFilters} />

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
            {filteredLeads.length !== leads.length &&
              ` (of ${leads.length})`}
          </span>
          {staleCount > 0 && (
            <Button
              variant={showStaleOnly ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setShowStaleOnly(!showStaleOnly)}
            >
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              {staleCount} stale
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!exportData || exportData.length === 0}
          >
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Pipeline columns */}
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
