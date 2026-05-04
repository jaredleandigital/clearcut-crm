import { query } from "./_generated/server";
import { checkAuth } from "./auth";

export const getMetrics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await checkAuth(ctx);
    if (!identity) return null;

    const leads = await ctx.db.query("leads").collect();

    const total = leads.length;
    const won = leads.filter((l) => l.status === "closed_won");
    const lost = leads.filter((l) => l.status === "closed_lost");
    const closed = won.length + lost.length;
    const winRate = closed > 0 ? (won.length / closed) * 100 : 0;

    // Pipeline value: sum estimatedValue of leads NOT in closed_won/closed_lost
    const activeLeads = leads.filter(
      (l) => l.status !== "closed_won" && l.status !== "closed_lost"
    );
    const pipelineValue = activeLeads.reduce(
      (sum, l) => sum + (l.estimatedValue || 0),
      0
    );

    // Weighted pipeline value: value * stage probability
    const stageProbability: Record<string, number> = {
      new_lead: 0.05,
      contacted: 0.1,
      qualified: 0.2,
      site_visit_booked: 0.35,
      site_visit_completed: 0.5,
      quote_sent: 0.65,
      quote_accepted: 0.85,
    };
    const weightedValue = activeLeads.reduce((sum, l) => {
      const prob = stageProbability[l.status] || 0.1;
      return sum + (l.estimatedValue || 0) * prob;
    }, 0);

    // Average days to close (for won deals)
    const daysToClose = won
      .filter((l) => l.statusChangedAt && l.createdAt)
      .map((l) => (l.statusChangedAt! - l.createdAt) / (1000 * 60 * 60 * 24));
    const avgDaysToClose =
      daysToClose.length > 0
        ? daysToClose.reduce((a, b) => a + b, 0) / daysToClose.length
        : 0;

    // Conversion rates per stage
    const stageOrder = [
      "new_lead",
      "contacted",
      "qualified",
      "site_visit_booked",
      "site_visit_completed",
      "quote_sent",
      "quote_accepted",
      "closed_won",
    ];
    const conversionRates = stageOrder.slice(0, -1).map((stage, i) => {
      const nextStage = stageOrder[i + 1];
      const stageIdx = stageOrder.indexOf(stage);
      const nextIdx = stageOrder.indexOf(nextStage);
      // Count leads that reached this stage (current or beyond)
      const reachedStage = leads.filter((l) => {
        const lIdx = stageOrder.indexOf(l.status);
        return lIdx >= stageIdx || l.status === "closed_lost";
      }).length;
      // Count leads that moved past this stage
      const movedPast = leads.filter((l) => {
        const lIdx = stageOrder.indexOf(l.status);
        return lIdx >= nextIdx;
      }).length;
      const rate = reachedStage > 0 ? (movedPast / reachedStage) * 100 : 0;
      return { from: stage, to: nextStage, rate: Math.round(rate) };
    });

    // Won revenue
    const wonRevenue = won.reduce(
      (sum, l) => sum + (l.estimatedValue || 0),
      0
    );

    return {
      total,
      wonCount: won.length,
      lostCount: lost.length,
      winRate: Math.round(winRate),
      pipelineValue,
      weightedValue: Math.round(weightedValue),
      avgDaysToClose: Math.round(avgDaysToClose),
      conversionRates,
      wonRevenue,
      activeCount: activeLeads.length,
    };
  },
});
