import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, checkAuth } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];
    return await ctx.db
      .query("notes")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const identity = await checkAuth(ctx);
    if (!identity) return null;
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    const now = Date.now();
    return await ctx.db.insert("notes", {
      ...args,
      createdAt: now,
      updatedAt: now,
      createdBy: identity.email ?? undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Note not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.delete(args.id);
  },
});
