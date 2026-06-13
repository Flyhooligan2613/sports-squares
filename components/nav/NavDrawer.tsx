"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import NavGamesSection from "@/components/platform/NavGamesSection";
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

export default function NavDrawer() {
  const pathname = usePathname();
  const { isOpen, close, userEmail, activeBoards, unreadMessages, unreadNotifications } =
    useNavDrawer();

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
        </div>

        <nav className="nav-drawer-scroll flex-1 overflow-y-auto">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.requiresAuth || userEmail
            );
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
                      const active = isNavItemActive(pathname, item.href);
                      const badge = badgeForItem(
                        item,
                        unreadMessages,
                        activeBoards,
                        unreadNotifications
                      );

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
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
        </nav>

        <div className="nav-drawer-footer">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sb-muted text-center">
            SquareBoards · Premium Multi-Game Platform
          </p>
        </div>
      </aside>
    </div>
  );
}
