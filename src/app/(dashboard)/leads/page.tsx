"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LeadPipeline } from "@/components/leads/lead-pipeline";
import { Button } from "@/components/ui/button";

function AuthorizedContent() {
  const access = useQuery(api.users.checkAccess);

  if (access === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Checking access...</div>
      </div>
    );
  }

  if (!access.authorized) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
          {access.email} is not authorized to access this CRM.
        </p>
        <p className="text-sm text-muted-foreground">
          Contact your administrator for access.
        </p>
      </div>
    );
  }

  return <LeadPipeline />;
}

export default function LeadsPage() {
  return (
    <>
      <SignedIn>
        <AuthorizedContent />
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
