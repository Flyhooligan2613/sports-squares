"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PlayerAvatar from "@/components/player/PlayerAvatar";
import { useNavDrawerSafe } from "@/components/nav/NavDrawerProvider";
import PlayerAccountSignupPrompt from "@/components/nav/PlayerAccountSignupPrompt";

const INTRO_STORAGE_KEY = "sb-player-account-intro-seen";

function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function hasSeenPlayerAccountIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markPlayerAccountIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

function SquareBoardAccountIcon() {
  return (
    <span
      className="player-avatar shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-900/50 to-sb-card border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 text-purple-200"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </span>
  );
}

interface PlayerNavAccount {
  avatar: string;
  href: string;
  followerCount: number;
}

export default function PlayerAccountNavButton() {
  const router = useRouter();
  const nav = useNavDrawerSafe();
  const userEmail = nav?.userEmail ?? null;
  const [account, setAccount] = useState<PlayerNavAccount | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      setAccount(null);
      return;
    }

    let cancelled = false;

    async function loadAccount() {
      const res = await fetch("/api/ecosystem/player-card", { cache: "no-store" }).catch(
        () => null
      );
      if (!res?.ok || cancelled) return;

      const data = (await res.json()) as {
        avatar?: string;
        sharePath?: string;
        account?: { followerCount?: number };
      };

      if (cancelled) return;

      setAccount({
        avatar: data.avatar ?? "🎮",
        href: data.sharePath ?? "/my-games",
        followerCount: data.account?.followerCount ?? 0,
      });
    }

    void loadAccount();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  const handleGuestClick = useCallback(() => {
    if (hasSeenPlayerAccountIntro()) {
      router.push("/my-games/login?next=/");
      return;
    }
    markPlayerAccountIntroSeen();
    setShowPrompt(true);
  }, [router]);

  const closePrompt = useCallback(() => {
    markPlayerAccountIntroSeen();
    setShowPrompt(false);
  }, []);

  const dismissPrompt = useCallback(() => {
    markPlayerAccountIntroSeen();
    setShowPrompt(false);
  }, []);

  const linkClassName =
    "flex items-center gap-1.5 sm:gap-2 shrink-0 rounded-full border border-white/10 bg-white/5 hover:border-purple-400/40 hover:bg-purple-500/10 transition-colors min-h-[44px]";

  const signedInLinkClassName = `${linkClassName} px-1.5 sm:px-2 max-w-[3.25rem] sm:max-w-none`;

  if (userEmail && account) {
    return (
      <Link
        href={account.href}
        className={signedInLinkClassName}
        aria-label={`Player profile · ${account.followerCount.toLocaleString()} followers`}
      >
        <span className="hidden sm:inline text-xs font-semibold text-white tabular-nums leading-none">
          {formatFollowerCount(account.followerCount)}
        </span>
        <PlayerAvatar emoji={account.avatar} size="md" />
      </Link>
    );
  }

  if (userEmail) {
    return (
      <Link
        href="/my-games"
        className={linkClassName}
        aria-label="Player account"
      >
        <PlayerAvatar size="md" />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleGuestClick}
        className={linkClassName}
        aria-label="Open SquareBoards player account"
      >
        <SquareBoardAccountIcon />
      </button>

      {showPrompt ? (
        <PlayerAccountSignupPrompt onClose={closePrompt} onDismiss={dismissPrompt} />
      ) : null}
    </>
  );
}
