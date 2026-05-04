import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, checkAuth } from "./auth";

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];
    return await ctx.db
      .query("followUps")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];
    const followUps = await ctx.db
      .query("followUps")
      .withIndex("by_completed", (q) => q.eq("completed", false))
      .order("asc")
      .collect();

    // Attach lead name to each follow-up
    const results = await Promise.all(
      followUps.map(async (fu) => {
        const lead = await ctx.db.get(fu.leadId);
        return {
          ...fu,
          leadName: lead?.name ?? "Unknown",
          leadStatus: lead?.status ?? "unknown",
        };
      })
    );
    return results;
  },
});

export const create = mutation({
  args: {
    leadId: v.id("leads"),
    dueAt: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    return await ctx.db.insert("followUps", {
      ...args,
      completed: false,
      createdAt: Date.now(),
      createdBy: identity.email ?? undefined,
    });
  },
});

export const markComplete = mutation({
  args: { id: v.id("followUps") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.patch(args.id, {
      completed: true,
      completedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("followUps") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.delete(args.id);
  },
});
