"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { STAGE_CONFIG, PipelineStage } from "@/lib/types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

function AnalyticsContent() {
  const leadsPerMonth = useQuery(api.analytics.leadsPerMonth);
  const leadsByService = useQuery(api.analytics.leadsByService);
  const metrics = useQuery(api.pipelineMetrics.getMetrics);

  if (leadsPerMonth === undefined || leadsByService === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const maxCount = Math.max(...leadsPerMonth.map((m) => m.count), 1);
  const totalLeads = leadsPerMonth.reduce((sum, m) => sum + m.count, 0);
  const maxServiceCount = Math.max(...leadsByService.map((s) => s.count), 1);

  return (
    <div className="space-y-8">
      {/* Pipeline Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Win Rate" value={`${metrics.winRate}%`} />
          <MetricCard
            label="Pipeline Value"
            value={`$${metrics.pipelineValue.toLocaleString()}`}
          />
          <MetricCard
            label="Weighted Value"
            value={`$${metrics.weightedValue.toLocaleString()}`}
          />
          <MetricCard
            label="Avg Days to Close"
            value={metrics.avgDaysToClose > 0 ? `${metrics.avgDaysToClose}d` : "-"}
          />
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Total Leads" value={String(totalLeads)} />
        <MetricCard label="Months Tracked" value={String(leadsPerMonth.length)} />
        <MetricCard
          label="Avg / Month"
          value={
            leadsPerMonth.length > 0
              ? (totalLeads / leadsPerMonth.length).toFixed(1)
              : "0"
          }
        />
        {metrics && (
          <MetricCard
            label="Won Revenue"
            value={`$${metrics.wonRevenue.toLocaleString()}`}
          />
        )}
      </div>

      {/* Win/Loss stats */}
      {metrics && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="mt-1 text-2xl font-bold">{metrics.activeCount}</div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground">Won</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {metrics.wonCount}
            </div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground">Lost</div>
            <div className="mt-1 text-2xl font-bold text-red-500">
              {metrics.lostCount}
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {metrics && metrics.conversionRates.length > 0 && (
        <div className="rounded-lg border bg-background p-6">
          <h2 className="mb-4 text-lg font-semibold">Conversion Funnel</h2>
          <div className="space-y-2">
            {metrics.conversionRates.map((cr) => {
              const fromConfig =
                STAGE_CONFIG[cr.from as PipelineStage];
              const toConfig =
                STAGE_CONFIG[cr.to as PipelineStage];
              return (
                <div key={cr.from} className="flex items-center gap-2">
                  <div className="w-28 shrink-0 text-right text-xs text-muted-foreground truncate">
                    {fromConfig?.label ?? cr.from}
                  </div>
                  <div className="flex-1">
                    <div className="relative h-6 rounded bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-[#007AC3]/70 transition-all"
                        style={{ width: `${Math.max(cr.rate, 2)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {cr.rate}%
                      </span>
                    </div>
                  </div>
                  <div className="w-28 shrink-0 text-xs text-muted-foreground truncate">
                    {toConfig?.label ?? cr.to}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leads per month bar chart */}
      <div className="rounded-lg border bg-background p-6">
        <h2 className="mb-6 text-lg font-semibold">Leads Per Month</h2>
        <div className="space-y-3">
          {leadsPerMonth.map((item) => (
            <div key={item.month} className="flex items-center gap-3">
              <div className="w-20 shrink-0 text-right text-sm text-muted-foreground">
                {formatMonth(item.month)}
              </div>
              <div className="flex-1">
                <div
                  className="h-8 rounded-md bg-[#007AC3] transition-all"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                    minWidth: item.count > 0 ? "2rem" : "0",
                  }}
                >
                  <span className="flex h-full items-center px-2 text-sm font-medium text-white">
                    {item.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads by service */}
      <div className="rounded-lg border bg-background p-6">
        <h2 className="mb-6 text-lg font-semibold">Leads By Service</h2>
        <div className="space-y-3">
          {leadsByService.map((item) => (
            <div key={item.service} className="flex items-center gap-3">
              <div className="w-32 shrink-0 text-right text-sm text-muted-foreground">
                {item.service}
              </div>
              <div className="flex-1">
                <div
                  className="h-8 rounded-md bg-[#007AC3]/80 transition-all"
                  style={{
                    width: `${(item.count / maxServiceCount) * 100}%`,
                    minWidth: item.count > 0 ? "2rem" : "0",
                  }}
                >
                  <span className="flex h-full items-center px-2 text-sm font-medium text-white">
                    {item.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <>
      <SignedIn>
        <AnalyticsContent />
      </SignedIn>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Sign in to view analytics</h2>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
