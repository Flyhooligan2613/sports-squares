"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import type { PlayerSocialProfile } from "@/lib/huddle/profileSocial";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import ProfileHeader from "./ProfileHeader";
import FollowListModal from "./FollowListModal";
import PlayerActivityFeed from "./PlayerActivityFeed";

export default function ProfileSocialView({
  profile,
  embedded = false,
}: {
  profile: PublicPlayerProfile;
  embedded?: boolean;
}) {
  const [social, setSocial] = useState<PlayerSocialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [listModal, setListModal] = useState<"followers" | "following" | null>(null);
  const [followerCount, setFollowerCount] = useState(profile.followerCount ?? 0);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/huddle/profile/${profile.slug}`, { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as PlayerSocialProfile;
      setSocial(json);
      setFollowerCount(json.followerCount);
    }
    setLoading(false);
  }, [profile.slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const pickCount = social?.pickPostCount ?? 0;
  const followingCount = social?.followingCount ?? profile.followingCount ?? 0;
  const winCount = social?.winHighlights.length ?? profile.stats.lifetimeWins;

  return (
    <>
      <ProfileHeader
        profile={profile}
        followerCount={followerCount}
        followingCount={followingCount}
        winCount={winCount}
        pickCount={pickCount}
        mutualConnections={social?.mutualConnections ?? []}
        embedded={embedded}
        onFollowChange={(following) =>
          setFollowerCount((c) => Math.max(0, c + (following ? 1 : -1)))
        }
        onFollowersClick={() => setListModal("followers")}
        onFollowingClick={() => setListModal("following")}
      />

      {/* Highlight stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
        <MiniStat label="Lifetime $" value={`$${profile.stats.lifetimeWinnings.toLocaleString()}`} />
        <MiniStat label="Win Streak" value={String(profile.stats.currentWinStreak)} />
        <MiniStat label="Best Streak" value={String(profile.stats.longestWinStreak)} />
        <MiniStat label="Boards" value={String(profile.stats.boardsPlayed)} />
      </div>

      {/* Activity feed */}
      <section aria-label="Player activity">
        <div className="flex items-center gap-4 border-b border-white/10 mb-6 pb-2">
          <span className="text-sm font-semibold text-white border-b-2 border-purple-400 pb-2 -mb-2.5">
            Activity
          </span>
          <Link href="/leaderboards" className="text-xs text-sb-muted hover:text-white ml-auto">
            Rankings →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 space-y-3" aria-busy="true">
            <div className="sb-xp-skeleton h-24 rounded-2xl max-w-md mx-auto" />
            <BrandedLoadingLabel context="profile" className="text-sb-muted" />
          </div>
        ) : (
          <PlayerActivityFeed
            profile={profile}
            feed={social?.feed ?? []}
            onPickUpdate={() => void load()}
          />
        )}
      </section>

      {listModal === "followers" && social ? (
        <FollowListModal
          title="Followers"
          users={social.followers}
          emptyContext="no_followers"
          onClose={() => setListModal(null)}
        />
      ) : null}
      {listModal === "following" && social ? (
        <FollowListModal
          title="Following"
          users={social.following}
          onClose={() => setListModal(null)}
        />
      ) : null}
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center sb-card-lift">
      <p className="text-sm font-bold text-white tabular-nums">{value}</p>
      <p className="text-[10px] text-sb-muted uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
