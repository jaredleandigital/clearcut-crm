"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_TYPES, LEAD_SOURCES, PIPELINE_STAGES, STAGE_CONFIG, PipelineStage } from "@/lib/types";
import { Search, X, Filter } from "lucide-react";

export interface SearchFilters {
  searchText: string;
  projectType: string;
  source: string;
  status: string;
}

interface SearchFiltersBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function SearchFiltersBar({ filters, onFiltersChange }: SearchFiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters =
    filters.searchText || filters.projectType || filters.source || filters.status;

  function clearAll() {
    onFiltersChange({ searchText: "", projectType: "", source: "", status: "" });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone..."
            value={filters.searchText}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchText: e.target.value })
            }
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          title="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.projectType || "__all__"}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, projectType: v === "__all__" ? "" : v })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Project Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.source || "__all__"}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, source: v === "__all__" ? "" : v })
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Sources</SelectItem>
              {LEAD_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "__all__"}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, status: v === "__all__" ? "" : v })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Stages</SelectItem>
              {PIPELINE_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {STAGE_CONFIG[stage].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
