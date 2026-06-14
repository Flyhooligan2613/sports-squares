"use client";

import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import PlayerHeaderQuickActions from "@/components/nav/PlayerHeaderQuickActions";
import PlayerAvatar from "@/components/player/PlayerAvatar";

function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface PlayerShellProps {
  children: React.ReactNode;
  userEmail?: string;
  displayName?: string;
  avatarEmoji?: string;
  profileHref?: string;
  followerCount?: number;
}

export default function PlayerShell({
  children,
  userEmail,
  avatarEmoji,
  profileHref = "/my-games/profile",
  followerCount = 0,
}: PlayerShellProps) {
  return (
    <div className="player-shell min-h-screen flex flex-col">
      <AppMenuBar
        logoHref="/my-games"
        rightSlot={
          <div className="flex items-center gap-0.5 sm:gap-1">
            <PlayerHeaderQuickActions />
            <Link
              href={profileHref}
              className="flex items-center gap-2 shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 hover:border-purple-400/40 hover:bg-purple-500/10 transition-colors"
              aria-label={`Profile · ${followerCount.toLocaleString()} followers`}
            >
              <span className="text-xs font-semibold text-white tabular-nums leading-none">
                {formatFollowerCount(followerCount)}
              </span>
              <PlayerAvatar emoji={avatarEmoji} size="md" />
            </Link>
          </div>
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
  data: {
    email: string;
    displayName?: string;
    avatarEmoji?: string;
    profileHref?: string;
    followerCount?: number;
  };
  children: React.ReactNode;
}) {
  return (
    <PlayerShell
      userEmail={data.email}
      displayName={data.displayName}
      avatarEmoji={data.avatarEmoji}
      profileHref={data.profileHref}
      followerCount={data.followerCount}
    >
      {children}
    </PlayerShell>
  );
}
