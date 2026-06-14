"use client";

import Logo from "@/components/Logo";
import NavDrawerTrigger from "@/components/nav/NavDrawerTrigger";
import NotificationBell from "@/components/nav/NotificationBell";
import PlayerAccountNavButton from "@/components/nav/PlayerAccountNavButton";
import PlayerHeaderQuickActions from "@/components/nav/PlayerHeaderQuickActions";
import { useNavDrawerSafe } from "@/components/nav/NavDrawerProvider";
import GlobalSearchTrigger from "@/components/search/GlobalSearchTrigger";

export default function Navbar() {
  const nav = useNavDrawerSafe();

  return (
    <header className="navbar-header sticky top-0 z-50 border-b border-white/[0.08] bg-sb-bg/88 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <NavDrawerTrigger />
          <Logo href="/" className="sb-logo-nav shrink-0" />
        </div>
        <div className="hidden md:flex flex-1 justify-center px-3 min-w-0 max-w-xl">
          <GlobalSearchTrigger className="w-full" />
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <GlobalSearchTrigger compact className="md:hidden" />
          {nav?.userEmail ? <PlayerHeaderQuickActions /> : null}
          <NotificationBell className="hidden sm:inline-flex" />
          <PlayerAccountNavButton />
        </div>
      </div>
    </header>
  );
}
