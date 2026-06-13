"use client";

import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import PlayerAvatar from "@/components/player/PlayerAvatar";

interface PlayerShellProps {
  children: React.ReactNode;
  userEmail?: string;
  displayName?: string;
  avatarEmoji?: string;
}

export default function PlayerShell({
  children,
  userEmail,
  avatarEmoji,
}: PlayerShellProps) {
  return (
    <div className="player-shell min-h-screen flex flex-col">
      <AppMenuBar
        logoHref="/my-games"
        rightSlot={
          <Link
            href="/my-games/profile"
            className="shrink-0"
            aria-label="Profile"
          >
            <PlayerAvatar emoji={avatarEmoji} size="md" />
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
  data: { email: string; displayName?: string; avatarEmoji?: string };
  children: React.ReactNode;
}) {
  return (
    <PlayerShell
      userEmail={data.email}
      displayName={data.displayName}
      avatarEmoji={data.avatarEmoji}
    >
      {children}
    </PlayerShell>
  );
}
