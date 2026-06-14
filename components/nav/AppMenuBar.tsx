"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import NavDrawerTrigger from "@/components/nav/NavDrawerTrigger";
import NotificationBell from "@/components/nav/NotificationBell";
import GlobalSearchTrigger from "@/components/search/GlobalSearchTrigger";

export default function AppMenuBar({
  logoHref = "/",
  rightSlot,
  hideMobileSearch = false,
}: {
  logoHref?: string;
  rightSlot?: React.ReactNode;
  /** Hide the mobile search chip when profile/actions already fill the header */
  hideMobileSearch?: boolean;
}) {
  return (
    <header className="app-menu-bar sticky top-0 z-50 border-b border-white/[0.08] bg-sb-bg/88 backdrop-blur-2xl">
      <div
        className={[
          "app-menu-bar-inner max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-3 min-w-0",
          rightSlot ? "app-menu-bar-has-actions" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="app-menu-bar-brand flex items-center gap-2 min-w-0 shrink">
          <NavDrawerTrigger />
          <Logo href={logoHref} variant="icon" className="sb-logo-nav shrink-0 md:hidden" />
          <Logo href={logoHref} className="sb-logo-nav shrink-0 hidden md:inline-flex" />
        </div>
        <div className="hidden md:flex flex-1 justify-center px-3 min-w-0 max-w-xl">
          <GlobalSearchTrigger className="w-full" />
        </div>
        <div className="app-menu-bar-actions flex items-center gap-0.5 sm:gap-1 shrink-0">
          {!hideMobileSearch ? (
            <GlobalSearchTrigger compact className="md:hidden app-menu-bar-mobile-search" />
          ) : null}
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
