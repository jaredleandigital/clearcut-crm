import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leads: defineTable({
    // Contact info
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),

    // Project info
    projectType: v.optional(v.string()),
    projectAddress: v.optional(v.string()),
    projectDescription: v.optional(v.string()),
    estimatedValue: v.optional(v.number()),

    // Pipeline
    status: v.string(),
    source: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    notes: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    statusChangedAt: v.optional(v.number()),

    // Lost reason
    lostReason: v.optional(v.string()),

    // Duplicate detection
    isDuplicate: v.optional(v.boolean()),
    duplicateOf: v.optional(v.id("leads")),
  })
    .index("by_status", ["status"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_createdAt", ["createdAt"])
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  activities: defineTable({
    leadId: v.id("leads"),
    type: v.string(), // call, email, site_visit, note, status_change, other
    title: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.object({
      oldStatus: v.optional(v.string()),
      newStatus: v.optional(v.string()),
    })),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_lead", ["leadId", "createdAt"])
    .index("by_createdAt", ["createdAt"]),

  followUps: defineTable({
    leadId: v.id("leads"),
    dueAt: v.number(),
    note: v.optional(v.string()),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_lead", ["leadId"])
    .index("by_dueAt", ["dueAt"])
    .index("by_completed", ["completed", "dueAt"]),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_updatedAt", ["updatedAt"]),
});
