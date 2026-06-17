"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import NavGamesSection from "@/components/platform/NavGamesSection";
import { useGlobalSearchSafe } from "@/components/search/GlobalSearchProvider";
import { signOutPlayer } from "@/lib/auth/playerAuthClient";
import {
  GAME_DAY_HREF,
  GAME_ROOM_HREF,
  navigateHomeMode,
} from "@/lib/home/hubSections";
import { isNavItemActive, NAV_SECTIONS, type NavItem } from "@/lib/navigation";
import { useNavDrawer } from "./NavDrawerProvider";

function badgeForItem(
  item: NavItem,
  unreadMessages: number,
  activeBoards: number,
  unreadNotifications: number
): number | null {
  if (item.badgeKey === "messages" && unreadMessages > 0) return unreadMessages;
  if (item.badgeKey === "notifications" && unreadNotifications > 0) {
    return unreadNotifications;
  }
  if (item.badgeKey === "live" && activeBoards > 0) return activeBoards;
  return null;
}

function NavDrawerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("mode");
  const router = useRouter();
  const globalSearch = useGlobalSearchSafe();
  const [signingOut, setSigningOut] = useState(false);
  const { isOpen, close, userEmail, activeBoards, unreadMessages, unreadNotifications } =
    useNavDrawer();

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutPlayer();
      close();
      router.push("/my-games/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div
      className={[
        "nav-drawer-root",
        isOpen ? "nav-drawer-root-open" : "",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="nav-drawer-backdrop"
        aria-label="Close menu"
        onClick={close}
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        className="nav-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="nav-drawer-header">
        <Link
          href={userEmail ? "/my-games" : "/"}
          onClick={close}
          className="inline-flex"
        >
          <Logo href={false} className="sb-logo-nav" />
        </Link>
          {userEmail ? (
            <div className="nav-drawer-user mt-4">
              <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Signed in as</p>
              <p className="text-sm font-semibold text-white truncate">{userEmail}</p>
              {activeBoards > 0 ? (
                <p className="text-xs text-sb-glow mt-1.5 font-medium">
                  {activeBoards} active board{activeBoards === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
          ) : (
            <Link
              href="/my-games/login"
              onClick={close}
              className="nav-drawer-signin mt-4"
            >
              Sign in to My Games
            </Link>
          )}
          <button
            type="button"
            className="global-search-trigger w-full mt-4"
            onClick={() => {
              close();
              globalSearch?.open();
            }}
          >
            <span className="global-search-trigger-icon" aria-hidden>
              🔍
            </span>
            <span className="global-search-trigger-label">Search players & features</span>
          </button>
        </div>

        <nav className="nav-drawer-scroll flex-1 min-h-0">
          <div className="nav-drawer-scroll-inner">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => {
              if (item.requiresAuth && !userEmail) return false;
              if (item.href === "/" && userEmail) return false;
              return !item.requiresAuth || userEmail;
            });
            const hasGames = section.renderGames != null;
            if (visibleItems.length === 0 && !hasGames) return null;

            return (
              <div key={section.id} className="nav-drawer-section">
                <p className="nav-drawer-section-title">{section.title}</p>
                {section.renderGames ? (
                  <NavGamesSection filter={section.renderGames} />
                ) : null}
                {visibleItems.length > 0 ? (
                  <ul className="space-y-1">
                    {visibleItems.map((item) => {
                      let active = isNavItemActive(pathname, item.href);
                      if (item.href === GAME_DAY_HREF) {
                        active =
                          pathname === "/my-games" &&
                          (viewMode === "gameday" || viewMode === null);
                      } else if (item.href === GAME_ROOM_HREF) {
                        active = pathname === "/my-games" && viewMode === "home";
                      }
                      const badge = badgeForItem(
                        item,
                        unreadMessages,
                        activeBoards,
                        unreadNotifications
                      );

                      const isHomeModeLink =
                        item.href === GAME_DAY_HREF || item.href === GAME_ROOM_HREF;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={(event) => {
                              close();
                              if (isHomeModeLink) {
                                event.preventDefault();
                                navigateHomeMode(router, pathname, item.href, viewMode);
                              }
                            }}
                            className={[
                              "nav-drawer-link",
                              active ? "nav-drawer-link-active" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <span className="nav-drawer-link-icon" aria-hidden>
                              {item.icon}
                            </span>
                            <span className="flex-1 min-w-0">{item.label}</span>
                            {badge != null ? (
                              <span className="nav-drawer-badge">{badge}</span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
          </div>
        </nav>

        <div className="nav-drawer-footer">
          {userEmail ? (
            <button
              type="button"
              className="nav-drawer-signout"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {signingOut ? "Signing out…" : "Log out"}
            </button>
          ) : null}
          <p className="text-[10px] uppercase tracking-[0.2em] text-sb-muted text-center">
            SquareBoards · Premium Multi-Game Platform
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function NavDrawer() {
  return (
    <Suspense fallback={null}>
      <NavDrawerInner />
    </Suspense>
  );
}
