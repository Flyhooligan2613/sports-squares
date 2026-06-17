"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import NavBackButton from "@/components/nav/NavBackButton";
import NavDrawerTrigger from "@/components/nav/NavDrawerTrigger";
import NotificationBell from "@/components/nav/NotificationBell";
import GlobalSearchTrigger from "@/components/search/GlobalSearchTrigger";
import { GAME_ROOM_HREF, navigateHomeMode } from "@/lib/home/hubSections";

function AppMenuBarInner({
  logoHref = GAME_ROOM_HREF,
  rightSlot,
  hideMobileSearch = false,
}: {
  logoHref?: string;
  rightSlot?: React.ReactNode;
  /** Hide the mobile search chip when profile/actions already fill the header */
  hideMobileSearch?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hubMode = searchParams.get("mode");

  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (logoHref !== GAME_ROOM_HREF) return;
    event.preventDefault();
    navigateHomeMode(router, pathname, GAME_ROOM_HREF, hubMode);
  }

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
        <div className="app-menu-bar-brand flex items-center gap-1 sm:gap-2 min-w-0 shrink">
          <NavDrawerTrigger />
          <NavBackButton />
          <Logo
            href={logoHref}
            variant="icon"
            className="sb-logo-nav shrink-0 md:hidden"
            onClick={handleLogoClick}
          />
          <Logo
            href={logoHref}
            className="sb-logo-nav shrink-0 hidden md:inline-flex"
            onClick={handleLogoClick}
          />
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

export default function AppMenuBar(props: {
  logoHref?: string;
  rightSlot?: React.ReactNode;
  hideMobileSearch?: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <AppMenuBarInner {...props} />
    </Suspense>
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
