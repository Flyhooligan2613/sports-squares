"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import NotificationHubShell from "@/components/player/NotificationHubShell";
import type { PlayerActivityItem } from "@/lib/notifications/buildPlayerActivity";
import { getPlayerSessionUser } from "@/lib/auth/playerAuthClient";
import { formatUserError } from "@/lib/errors/formatUserError";

function formatActivityDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ActivityCenter() {
  const [activity, setActivity] = useState<PlayerActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const user = await getPlayerSessionUser();
        if (!user?.email) {
          if (!cancelled) setError("Sign in to view your activity.");
          return;
        }

        const res = await fetch("/api/player/activity?limit=50", { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load activity");
        }

        const data = (await res.json()) as { activity: PlayerActivityItem[] };
        if (!cancelled) setActivity(data.activity ?? []);
      } catch (err) {
        if (!cancelled) setError(formatUserError(err, "load"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <NotificationHubShell
        title="Activity"
        subtitle="Your competition timeline — wins, milestones, and wallet events."
      >
        <div className="space-y-3" aria-busy="true">
          <div className="sb-xp-skeleton h-24 rounded-2xl" />
          <div className="sb-xp-skeleton h-24 rounded-2xl" />
          <BrandedLoadingLabel context="general" className="text-center text-sb-muted py-4" />
        </div>
      </NotificationHubShell>
    );
  }

  if (error) {
    return (
      <NotificationHubShell
        title="Activity"
        subtitle="Your competition timeline — wins, milestones, and wallet events."
      >
        <LandingGlassCard className="p-8 text-center">
          <p className="text-white font-semibold mb-2">{error}</p>
          <Link href="/my-games/login" className="text-sm text-sb-glow hover:text-white">
            Sign in →
          </Link>
        </LandingGlassCard>
      </NotificationHubShell>
    );
  }

  return (
    <NotificationHubShell
      title="Activity"
      subtitle="Your competition timeline — wins, milestones, and wallet events."
    >
      {activity.length === 0 ? (
        <AliveEmptyState
          context="no_activity_center"
          emoji="📜"
          title="Your activity timeline will grow as you compete"
          body="Your activity timeline will grow as you compete and interact on SquareBoards."
        />
      ) : (
        <div className="player-timeline space-y-0" role="feed" aria-label="Your activity">
          {activity.map((item, index) => (
            <div
              key={item.id}
              className="player-timeline-item admin-stat-enter"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="player-timeline-marker">
                <span aria-hidden>{item.emoji}</span>
              </div>
              <LandingGlassCard className="player-timeline-card p-4 sm:p-5 flex-1 sb-card-lift transition-all duration-[250ms]">
                <p className={`text-xs uppercase tracking-wider mb-1 ${item.accent ?? "text-sb-glow"}`}>
                  {item.label}
                </p>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm text-sb-muted mt-0.5">{item.detail}</p>
                <time className="text-xs text-sb-muted/70 mt-2 block" dateTime={item.at}>
                  {formatActivityDate(item.at)}
                </time>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="inline-flex items-center min-h-[44px] mt-2 text-xs font-semibold text-sb-glow hover:text-white transition-colors duration-[250ms]"
                  >
                    View details →
                  </Link>
                ) : null}
              </LandingGlassCard>
            </div>
          ))}
        </div>
      )}
    </NotificationHubShell>
  );
}
