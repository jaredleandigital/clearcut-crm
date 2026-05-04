import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const insertLead = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    projectType: v.optional(v.string()),
    projectAddress: v.optional(v.string()),
    projectDescription: v.optional(v.string()),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    // No auth check for seeding
    const { createdAt, ...rest } = args;
    return await ctx.db.insert("leads", {
      ...rest,
      status: "new_lead",
      createdAt,
      updatedAt: createdAt,
      statusChangedAt: createdAt,
    });
  },
});

export const clearAllLeads = mutation({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query("leads").collect();
    for (const lead of leads) {
      await ctx.db.delete(lead._id);
    }
    return leads.length;
  },
});
