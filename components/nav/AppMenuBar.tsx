"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import NavDrawerTrigger from "@/components/nav/NavDrawerTrigger";
import NotificationBell from "@/components/nav/NotificationBell";

export default function AppMenuBar({
  logoHref = "/",
  rightSlot,
}: {
  logoHref?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="app-menu-bar sticky top-0 z-50 border-b border-white/[0.08] bg-sb-bg/88 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <NavDrawerTrigger />
          <Logo href={logoHref} className="sb-logo-nav shrink-0" />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {rightSlot}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}

export function AppMenuBarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-sb-glow hover:text-white transition-colors shrink-0"
    >
      {children}
    </Link>
  );
}
