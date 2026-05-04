import { query } from "./_generated/server";
import { checkAuth } from "./auth";

export const leadsPerMonth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];

    const leads = await ctx.db.query("leads").order("asc").collect();

    const months: Record<string, number> = {};
    for (const lead of leads) {
      const date = new Date(lead.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    }

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  },
});

export const leadsByService = query({
  args: {},
  handler: async (ctx) => {
    const identity = await checkAuth(ctx);
    if (!identity) return [];

    const leads = await ctx.db.query("leads").collect();

    const services: Record<string, number> = {};
    for (const lead of leads) {
      const service = lead.projectType || "Unknown";
      services[service] = (services[service] || 0) + 1;
    }

    return Object.entries(services)
      .sort(([, a], [, b]) => b - a)
      .map(([service, count]) => ({ service, count }));
  },
});
