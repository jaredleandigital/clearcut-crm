import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
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

export const search = query({
  args: {
    searchText: v.optional(v.string()),
    projectType: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];

    let leads = await ctx.db.query("leads").order("desc").collect();

    // Text search: name, email, phone
    if (args.searchText) {
      const q = args.searchText.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.phone && l.phone.toLowerCase().includes(q))
      );
    }

    // Filter by project type
    if (args.projectType) {
      leads = leads.filter((l) => l.projectType === args.projectType);
    }

    // Filter by source
    if (args.source) {
      leads = leads.filter((l) => l.source === args.source);
    }

    // Filter by status
    if (args.status) {
      leads = leads.filter((l) => l.status === args.status);
    }

    return leads;
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
    const oldStatus = existing.status;
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
      statusChangedAt: now,
    };

    if (args.lostReason) {
      updates.lostReason = args.lostReason;
    }

    await ctx.db.patch(args.id, updates);

    // Auto-log status change activity
    if (oldStatus !== args.status) {
      await ctx.db.insert("activities", {
        leadId: args.id,
        type: "status_change",
        title: `Status changed`,
        description: `Moved from ${oldStatus} to ${args.status}`,
        metadata: {
          oldStatus,
          newStatus: args.status,
        },
        createdAt: now,
      });
    }
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

    // Duplicate detection: check email and phone
    let isDuplicate = false;
    let duplicateOf: Id<"leads"> | undefined;

    if (args.email) {
      const emailMatch = await ctx.db
        .query("leads")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      if (emailMatch) {
        isDuplicate = true;
        duplicateOf = emailMatch._id;
      }
    }

    if (!isDuplicate && args.phone) {
      const phoneMatch = await ctx.db
        .query("leads")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (phoneMatch) {
        isDuplicate = true;
        duplicateOf = phoneMatch._id;
      }
    }

    const leadId = await ctx.db.insert("leads", {
      ...args,
      status: "new_lead",
      createdAt: now,
      updatedAt: now,
      statusChangedAt: now,
      isDuplicate: isDuplicate || undefined,
      duplicateOf,
    });

    return leadId;
  },
});

export const remove = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Also remove related activities and follow-ups
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_lead", (q) => q.eq("leadId", args.id))
      .collect();
    for (const a of activities) {
      await ctx.db.delete(a._id);
    }

    const followUps = await ctx.db
      .query("followUps")
      .withIndex("by_lead", (q) => q.eq("leadId", args.id))
      .collect();
    for (const f of followUps) {
      await ctx.db.delete(f._id);
    }

    await ctx.db.delete(args.id);
  },
});
