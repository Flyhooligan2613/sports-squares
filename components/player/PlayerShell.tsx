"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import type { PlayerDashboardData } from "@/lib/player/dashboardTypes";

interface PlayerShellProps {
  children: React.ReactNode;
  userEmail?: string;
  displayName?: string;
}

const NAV = [
  { href: "/my-games", label: "My Games" },
  { href: "/games/nfl", label: "Browse Games" },
  { href: "/my-games/history", label: "History" },
  { href: "/my-games/profile", label: "Profile" },
];

function initialsFromUser(email?: string, name?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "P").toUpperCase();
}

export default function PlayerShell({
  children,
  userEmail,
  displayName,
}: PlayerShellProps) {
  const pathname = usePathname();
  const initials = initialsFromUser(userEmail, displayName);

  return (
    <div className="player-shell min-h-screen flex flex-col">
      <header className="player-header sticky top-0 z-50 border-b border-white/[0.08] bg-sb-bg/88 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 sm:gap-10 min-w-0">
            <Logo href="/my-games" className="sb-logo-nav shrink-0" />
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => {
                const active =
                  item.href === "/my-games"
                    ? pathname === "/my-games"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "player-nav-link",
                      active ? "player-nav-link-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Link
            href="/my-games/profile"
            className="player-avatar shrink-0"
            aria-label="Profile"
          >
            {initials}
          </Link>
        </div>

        <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/my-games"
                ? pathname === "/my-games"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "player-nav-link player-nav-link-mobile whitespace-nowrap",
                  active ? "player-nav-link-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

export function PlayerShellFromData({
  data,
  children,
}: {
  data: Pick<PlayerDashboardData, "email" | "displayName">;
  children: React.ReactNode;
}) {
  return (
    <PlayerShell userEmail={data.email} displayName={data.displayName}>
      {children}
    </PlayerShell>
  );
}
