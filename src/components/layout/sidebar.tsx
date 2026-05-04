"use client";

import { LayoutDashboard, BarChart3, Bell, FileText, BookOpen, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/leads", label: "Pipeline", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/rules", label: "Rules", icon: BookOpen },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <>
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href="/leads" className="flex items-center" onClick={onMobileClose}>
          <Image
            src="/logo-light.png"
            alt="Clearcut Building Solutions"
            width={180}
            height={40}
            className="h-8 w-auto dark:hidden"
            priority
          />
          <Image
            src="/logo-dark.png"
            alt="Clearcut Building Solutions"
            width={180}
            height={40}
            className="hidden h-8 w-auto dark:block"
            priority
          />
        </Link>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-col border-r bg-background md:flex">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background shadow-lg md:hidden">
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}
