"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import NavDrawerTrigger from "@/components/nav/NavDrawerTrigger";
import NotificationBell from "@/components/nav/NotificationBell";

export default function Navbar() {
  return (
    <header className="navbar-header sticky top-0 z-50 border-b border-white/[0.08] bg-sb-bg/88 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <NavDrawerTrigger />
          <Logo href="/" className="sb-logo-nav shrink-0" />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell className="hidden sm:inline-flex" />
          <Link
            href="/my-games"
            className="text-sm font-semibold text-sb-glow hover:text-white transition-colors shrink-0 min-h-[44px] inline-flex items-center px-2"
          >
            My Games
          </Link>
        </div>
      </div>
    </header>
  );
}
