"use client";

import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import type { PlayerDashboardData } from "@/lib/player/dashboardTypes";

interface PlayerShellProps {
  children: React.ReactNode;
  userEmail?: string;
  displayName?: string;
}

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
  const initials = initialsFromUser(userEmail, displayName);

  return (
    <div className="player-shell min-h-screen flex flex-col">
      <AppMenuBar
        logoHref="/my-games"
        rightSlot={
          <Link
            href="/my-games/profile"
            className="player-avatar shrink-0"
            aria-label="Profile"
          >
            {initials}
          </Link>
        }
      />
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
