"use client";

import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import NavDrawerTrigger from "@/components/nav/NavDrawerTrigger";
import NotificationBell from "@/components/nav/NotificationBell";
import PlayerAccountNavButton from "@/components/nav/PlayerAccountNavButton";
import PlayerHeaderQuickActions from "@/components/nav/PlayerHeaderQuickActions";
import { WalletBalanceChip } from "@/components/square-wallet";
import { useNavDrawerSafe } from "@/components/nav/NavDrawerProvider";
import GlobalSearchTrigger from "@/components/search/GlobalSearchTrigger";

export default function Navbar() {
  const pathname = usePathname();
  const nav = useNavDrawerSafe();
  const signedIn = Boolean(nav?.userEmail);
  const isHome = pathname === "/";

  return (
    <header className="navbar-header sticky top-0 z-50 border-b border-white/[0.08] bg-sb-bg/88 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
      <div
        className={[
          "app-menu-bar-inner max-w-6xl mx-auto px-3 sm:px-6 h-12 sm:h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-3 min-w-0",
          signedIn ? "app-menu-bar-has-actions" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="app-menu-bar-brand flex items-center gap-2 min-w-0 shrink">
          <NavDrawerTrigger />
          <Logo href="/" variant="icon" className="sb-logo-nav shrink-0 md:hidden" />
          <Logo href="/" className="sb-logo-nav shrink-0 hidden md:inline-flex" />
        </div>
        <div className="hidden md:flex flex-1 justify-center px-3 min-w-0 max-w-xl">
          {!isHome ? <GlobalSearchTrigger className="w-full" /> : null}
        </div>
        <div className="app-menu-bar-actions flex items-center gap-0.5 sm:gap-1 shrink-0">
          {!signedIn && !isHome ? (
            <GlobalSearchTrigger compact className="md:hidden app-menu-bar-mobile-search" />
          ) : null}
          {signedIn ? <PlayerHeaderQuickActions /> : null}
          {signedIn ? <WalletBalanceChip /> : null}
          <NotificationBell />
          <PlayerAccountNavButton />
        </div>
      </div>
    </header>
  );
}
