"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useNavDrawerSafe } from "@/components/nav/NavDrawerProvider";
import { PLAYER_TERMS } from "@/lib/platform/language";

const iconLinkClass =
  "nav-header-icon inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-sb-muted hover:text-white hover:bg-white/5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40";

interface PlayerHeaderQuickActionsProps {
  className?: string;
  /** Canonical player profile path, e.g. `/profile/username-slug` */
  profileHref?: string;
}

export default function PlayerHeaderQuickActions({
  className = "",
  profileHref: profileHrefProp,
}: PlayerHeaderQuickActionsProps) {
  const nav = useNavDrawerSafe();
  const userEmail = nav?.userEmail ?? null;
  const [fetchedProfileHref, setFetchedProfileHref] = useState<string | null>(null);

  useEffect(() => {
    if (profileHrefProp || !userEmail) {
      setFetchedProfileHref(null);
      return;
    }

    let cancelled = false;

    async function loadProfileHref() {
      const res = await fetch("/api/ecosystem/player-card", { cache: "no-store" }).catch(
        () => null
      );
      if (!res?.ok || cancelled) return;

      const data = (await res.json()) as { sharePath?: string };
      if (cancelled || !data.sharePath) return;

      setFetchedProfileHref(data.sharePath);
    }

    void loadProfileHref();
    return () => {
      cancelled = true;
    };
  }, [profileHrefProp, userEmail]);

  const profileHref = profileHrefProp ?? fetchedProfileHref ?? "/my-games/profile";

  return (
    <div className={["flex items-center gap-0.5 sm:gap-1", className].filter(Boolean).join(" ")}>
      <Link
        href={profileHref}
        className={iconLinkClass}
        aria-label={PLAYER_TERMS.competitorProfile}
        title={PLAYER_TERMS.competitorProfile}
      >
        <UserRound className="w-5 h-5" strokeWidth={1.75} aria-hidden />
      </Link>
    </div>
  );
}
