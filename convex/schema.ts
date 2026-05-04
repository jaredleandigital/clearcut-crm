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
  })
    .index("by_status", ["status"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_createdAt", ["createdAt"]),
});
