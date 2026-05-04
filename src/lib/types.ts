export const PIPELINE_STAGES = [
  "new_lead",
  "contacted",
  "qualified",
  "site_visit_booked",
  "site_visit_completed",
  "quote_sent",
  "quote_accepted",
  "closed_won",
  "closed_lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const STAGE_CONFIG: Record<
  PipelineStage,
  { label: string; color: string }
> = {
  new_lead: { label: "New Lead", color: "#6366f1" },
  contacted: { label: "Contacted", color: "#3b82f6" },
  qualified: { label: "Qualified", color: "#0ea5e9" },
  site_visit_booked: { label: "Site Visit Booked", color: "#f59e0b" },
  site_visit_completed: { label: "Site Visit Done", color: "#8b5cf6" },
  quote_sent: { label: "Quote Sent", color: "#ec4899" },
  quote_accepted: { label: "Quote Accepted", color: "#14b8a6" },
  closed_won: { label: "Closed Won", color: "#10b981" },
  closed_lost: { label: "Closed Lost", color: "#ef4444" },
};

export const PROJECT_TYPES = [
  "New Build",
  "Renovation",
  "Extension",
  "Bathroom",
  "Kitchen",
  "Deck/Outdoor",
  "Commercial",
  "Other",
] as const;

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Google",
  "Trade Me",
  "Facebook",
  "Repeat Client",
  "Other",
] as const;
