"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function RulesContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">CRM Rules & Logic</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How the Clearcut CRM pipeline works, what triggers automations, and
          how leads are managed.
        </p>
      </div>

      {/* Pipeline Stages */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium">Pipeline Stages</h3>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Next Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-[#6366f1] text-white">New Lead</Badge></TableCell>
                <TableCell>Just came in via website form or manual entry</TableCell>
                <TableCell>Review and make first contact within 24h</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-[#3b82f6] text-white">Contacted</Badge></TableCell>
                <TableCell>First contact made (call, email, or text)</TableCell>
                <TableCell>Qualify: understand scope, budget, timeline</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-[#0ea5e9] text-white">Qualified</Badge></TableCell>
                <TableCell>Confirmed as a genuine opportunity</TableCell>
                <TableCell>Book a site visit</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-[#f59e0b] text-white">Site Visit Booked</Badge></TableCell>
                <TableCell>On-site meeting scheduled</TableCell>
                <TableCell>Attend visit, take measurements, discuss scope</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-[#8b5cf6] text-white">Site Visit Done</Badge></TableCell>
                <TableCell>Visit completed, scope confirmed</TableCell>
                <TableCell>Prepare and send quote</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-[#ec4899] text-white">Quote Sent</Badge></TableCell>
                <TableCell>Quote/proposal delivered to client</TableCell>
                <TableCell>Follow up within 3-5 days if no response</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-[#14b8a6] text-white">Quote Accepted</Badge></TableCell>
                <TableCell>Client accepted the quote</TableCell>
                <TableCell>Send contract, schedule start date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-[#10b981] text-white">Closed Won</Badge></TableCell>
                <TableCell>Deal closed, project confirmed</TableCell>
                <TableCell>Hand off to project management</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-[#ef4444] text-white">Closed Lost</Badge></TableCell>
                <TableCell>Deal did not proceed</TableCell>
                <TableCell>Log reason, review in quarterly analysis</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Stale Lead Rules */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium">Stale Lead Alerts</h3>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Days in Stage</TableHead>
                <TableHead>Alert</TableHead>
                <TableHead>Action Required</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>7+ days</TableCell>
                <TableCell><Badge variant="outline" className="border-yellow-400 text-yellow-600">Warning</Badge></TableCell>
                <TableCell>Review lead, make contact or update status</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>14+ days</TableCell>
                <TableCell><Badge variant="outline" className="border-red-400 text-red-600">Critical</Badge></TableCell>
                <TableCell>Immediate action needed - lead at risk of going cold</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground">
          Stale alerts do not apply to Closed Won or Closed Lost stages.
        </p>
      </section>

      {/* Duplicate Detection */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium">Duplicate Detection</h3>
        <p className="text-sm text-muted-foreground">
          When a new lead arrives via the website form, the system checks for existing leads
          with the same email address or phone number. If a match is found, the new lead
          is flagged as a potential duplicate with a link to the original.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
          <li>Email matching is checked first, then phone if no email match</li>
          <li>Duplicates are flagged but still created (not blocked)</li>
          <li>A badge appears on the card and detail panel</li>
          <li>Review and merge/delete manually</li>
        </ul>
      </section>

      {/* Follow-up Rules */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium">Follow-up Reminders</h3>
        <p className="text-sm text-muted-foreground">
          Set reminders on any lead. Overdue reminders show a red dot on the pipeline
          card and appear on the Follow-ups dashboard page.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
          <li>Reminders can be set to any future date/time</li>
          <li>Overdue reminders are highlighted in red</li>
          <li>Completed reminders are marked green</li>
          <li>Reminders are deleted when the lead is deleted</li>
        </ul>
      </section>

      {/* Activity Logging */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium">Activity Logging</h3>
        <p className="text-sm text-muted-foreground">
          Every interaction with a lead should be logged. Status changes are logged
          automatically.
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity Type</TableHead>
                <TableHead>When to Log</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Call</TableCell>
                <TableCell>After any phone call with the lead</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>After sending or receiving an important email</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Site Visit</TableCell>
                <TableCell>After completing an on-site meeting</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Note</TableCell>
                <TableCell>General notes about the lead or project</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status Change</TableCell>
                <TableCell>Automatic when pipeline stage changes</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Webhook Integration */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium">Website Integration</h3>
        <p className="text-sm text-muted-foreground">
          Leads from the Clearcut Builders website contact form are automatically
          imported into the pipeline as &quot;New Lead&quot; with source set to &quot;Website&quot;.
          The system attempts to detect the project type from the form message.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
          <li>Form submissions arrive via webhook</li>
          <li>Duplicate detection runs on import</li>
          <li>Project type is inferred from keywords (kitchen, bathroom, etc.)</li>
          <li>All fields are optional except name</li>
        </ul>
      </section>

      {/* Pipeline Metrics */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium">Pipeline Metrics</h3>
        <p className="text-sm text-muted-foreground">
          The Analytics page shows conversion metrics including:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
          <li><strong>Win Rate</strong> - Closed Won / (Closed Won + Closed Lost)</li>
          <li><strong>Pipeline Value</strong> - Sum of estimated values for active leads</li>
          <li><strong>Weighted Value</strong> - Pipeline value weighted by stage probability</li>
          <li><strong>Avg Days to Close</strong> - Average time from creation to Closed Won</li>
          <li><strong>Conversion Rates</strong> - Drop-off between each pipeline stage</li>
        </ul>
      </section>
    </div>
  );
}

export default function RulesPage() {
  return (
    <>
      <SignedIn>
        <RulesContent />
      </SignedIn>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Sign in to view CRM rules</h2>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
