"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { LeadPipeline } from "@/components/leads/lead-pipeline";
import { Button } from "@/components/ui/button";

export default function LeadsPage() {
  return (
    <>
      <SignedIn>
        <LeadPipeline />
      </SignedIn>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Sign in to access the pipeline</h2>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
