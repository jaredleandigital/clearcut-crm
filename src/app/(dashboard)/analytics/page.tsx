"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";

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
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-background p-4">
          <div className="text-sm text-muted-foreground">Total Leads</div>
          <div className="mt-1 text-3xl font-bold">{totalLeads}</div>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="text-sm text-muted-foreground">Months Tracked</div>
          <div className="mt-1 text-3xl font-bold">{leadsPerMonth.length}</div>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="text-sm text-muted-foreground">Avg / Month</div>
          <div className="mt-1 text-3xl font-bold">
            {leadsPerMonth.length > 0
              ? (totalLeads / leadsPerMonth.length).toFixed(1)
              : 0}
          </div>
        </div>
      </div>

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
