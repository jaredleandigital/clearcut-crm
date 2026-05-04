import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, checkAuth } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];
    return await ctx.db.query("leads").order("desc").collect();
  },
});

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];
    return await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    const identity = await checkAuth(ctx);
    if (!identity) return null;
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    projectType: v.optional(v.string()),
    projectAddress: v.optional(v.string()),
    projectDescription: v.optional(v.string()),
    estimatedValue: v.optional(v.number()),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const now = Date.now();
    return await ctx.db.insert("leads", {
      ...args,
      status: "new_lead",
      createdAt: now,
      updatedAt: now,
      statusChangedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("leads"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    projectType: v.optional(v.string()),
    projectAddress: v.optional(v.string()),
    projectDescription: v.optional(v.string()),
    estimatedValue: v.optional(v.number()),
    source: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    notes: v.optional(v.string()),
    lostReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Lead not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(id, updates);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.string(),
    lostReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Lead not found");

    const now = Date.now();
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
      statusChangedAt: now,
    };

    if (args.lostReason) {
      updates.lostReason = args.lostReason;
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Called by webhook HTTP action (no user auth, already verified by secret)
export const createFromWebhook = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    projectType: v.optional(v.string()),
    projectAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("leads", {
      ...args,
      status: "new_lead",
      createdAt: now,
      updatedAt: now,
      statusChangedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.delete(args.id);
  },
});
