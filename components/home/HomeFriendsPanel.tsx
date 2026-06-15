"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { HomeFriendsPanel as HomeFriendsData } from "@/lib/gameDay/types";

export default function HomeFriendsPanel({ data }: { data: HomeFriendsData }) {
  const hasContent =
    data.friendsPlayingToday > 0 ||
    data.communityOnline > 0 ||
    data.newestFollowers.length > 0 ||
    data.friendHighlights.length > 0;

  if (!hasContent) return null;

  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="gd-section-title home-section-title">Friends Are Playing</h2>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <LandingGlassCard className="home-stat-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">Friends Today</p>
          <p className="text-2xl font-bold text-white tabular-nums">{data.friendsPlayingToday}</p>
        </LandingGlassCard>
        <LandingGlassCard className="home-stat-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">Community Online</p>
          <p className="text-2xl font-bold text-sb-glow tabular-nums">
            {data.communityOnline.toLocaleString()}
          </p>
        </LandingGlassCard>
        <LandingGlassCard className="home-stat-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">New Followers</p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {data.newestFollowers.length}
          </p>
        </LandingGlassCard>
      </div>

      {data.newestFollowers.length > 0 ? (
        <LandingGlassCard className="p-4 sm:p-5 mb-4">
          <p className="text-xs uppercase tracking-wider text-sb-glow font-semibold mb-3">
            Newest Followers
          </p>
          <ul className="space-y-2">
            {data.newestFollowers.map((follower) => (
              <li key={follower.id}>
                <Link
                  href={follower.href ?? "/huddle"}
                  className="flex items-center gap-3 py-1.5 hover:opacity-90 transition-opacity"
                >
                  <span className="text-lg" aria-hidden>
                    {follower.emoji}
                  </span>
                  <span className="text-sm text-white font-medium">{follower.name}</span>
                  <span className="text-xs text-sb-muted ml-auto">followed you</span>
                </Link>
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      ) : null}

      {data.friendHighlights.length > 0 ? (
        <LandingGlassCard className="p-4 sm:p-5 divide-y divide-white/5">
          <p className="text-xs uppercase tracking-wider text-sb-glow font-semibold mb-3 pb-0">
            Friend Activity
          </p>
          {data.friendHighlights.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="text-lg" aria-hidden>
                {item.emoji}
              </span>
              <p className="text-sm text-white flex-1">
                <span className="font-semibold">{item.name}</span>{" "}
                <span className="text-sb-muted">{item.action}</span>
              </p>
            </div>
          ))}
        </LandingGlassCard>
      ) : null}
    </section>
  );
}
