"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type {
  GameDayCommunityMoment,
  GameDayEmotionalNotification,
  GameDayFriendActivity,
  GameDayRecap,
} from "@/lib/gameDay/types";

export function GameDayNotifications({
  notifications,
}: {
  notifications: GameDayEmotionalNotification[];
}) {
  if (!notifications.length) return null;

  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="gd-section-title">For You</h2>
      <ul className="space-y-3">
        {notifications.map((n) => {
          const inner = (
            <LandingGlassCard className="p-4 gd-notification-card">
              <div className="flex gap-3">
                <span className="text-xl" aria-hidden>
                  {n.emoji}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{n.title}</p>
                  <p className="text-xs text-sb-muted mt-0.5">{n.body}</p>
                </div>
              </div>
            </LandingGlassCard>
          );

          return (
            <li key={n.id}>
              {n.href ? (
                <Link href={n.href} className="block hover:opacity-90 transition-opacity">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function GameDayFriendsFeed({ items }: { items: GameDayFriendActivity[] }) {
  if (!items.length) return null;

  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="gd-section-title">Friends & Following</h2>
      <LandingGlassCard className="p-4 sm:p-5 divide-y divide-white/5">
        {items.map((item) => (
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
    </section>
  );
}

export function GameDayCommunityMoments({ items }: { items: GameDayCommunityMoment[] }) {
  if (!items.length) return null;

  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="gd-section-title">Community Moments</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href ?? "/huddle"}
            className="gd-community-card block"
          >
            <span className="text-2xl mb-2 block" aria-hidden>
              {item.emoji}
            </span>
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="text-xs text-sb-muted mt-1">{item.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GameDayRecapPanel({ recap }: { recap: GameDayRecap }) {
  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="gd-section-title">Game Day Summary</h2>
      <LandingGlassCard className="p-5 sm:p-6 gd-recap-card">
        <p className="text-base text-white font-medium mb-4">{recap.headline}</p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Wins</dt>
            <dd className="text-xl font-bold text-white tabular-nums">{recap.wins}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">XP Gained</dt>
            <dd className="text-xl font-bold text-sb-glow tabular-nums">{recap.xpGained}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Tier</dt>
            <dd className="text-xl font-bold text-white">{recap.tierProgressPct}%</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Followers</dt>
            <dd className="text-xl font-bold text-white tabular-nums">+{recap.newFollowers}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/my-games/winnings" className="gd-recap-link">
            View winnings →
          </Link>
          <Link href="/action-center" className="gd-recap-link">
            Tomorrow&apos;s boards →
          </Link>
        </div>
      </LandingGlassCard>
    </section>
  );
}
