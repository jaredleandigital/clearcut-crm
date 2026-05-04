"use client";

import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <h1 className="text-lg font-semibold">Leads Pipeline</h1>
      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}
