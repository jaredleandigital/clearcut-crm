import { query } from "./_generated/server";
import { checkAuth } from "./auth";

export const exportLeads = query({
  args: {},
  handler: async (ctx) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];

    const leads = await ctx.db.query("leads").order("desc").collect();

    return leads.map((l) => ({
      name: l.name,
      email: l.email ?? "",
      phone: l.phone ?? "",
      status: l.status,
      projectType: l.projectType ?? "",
      projectAddress: l.projectAddress ?? "",
      projectDescription: l.projectDescription ?? "",
      estimatedValue: l.estimatedValue ?? "",
      source: l.source ?? "",
      assignedTo: l.assignedTo ?? "",
      notes: l.notes ?? "",
      lostReason: l.lostReason ?? "",
      isDuplicate: l.isDuplicate ? "Yes" : "",
      createdAt: new Date(l.createdAt).toISOString(),
      updatedAt: new Date(l.updatedAt).toISOString(),
      statusChangedAt: l.statusChangedAt
        ? new Date(l.statusChangedAt).toISOString()
        : "",
    }));
  },
});
