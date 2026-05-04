import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, checkAuth } from "./auth";

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];
    return await ctx.db
      .query("activities")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    leadId: v.id("leads"),
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.object({
      oldStatus: v.optional(v.string()),
      newStatus: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    return await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
      createdBy: identity.email ?? undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.delete(args.id);
  },
});
