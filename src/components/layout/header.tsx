"use client";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/leads": "Leads Pipeline",
  "/analytics": "Analytics",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Clearcut CRM";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button variant="outline" size="sm">Sign In</Button>
        </SignInButton>
      </SignedOut>
    </header>
  );
}
