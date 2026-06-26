"use client";

import Link from "next/link";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PickPostCard from "@/components/huddle/PickPostCard";
import type { ProfileFeedItem } from "@/lib/huddle/profileSocial";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";

interface PlayerActivityFeedProps {
  profile: PublicPlayerProfile;
  feed: ProfileFeedItem[];
  loading?: boolean;
  onPickUpdate?: () => void;
}

type ActivityItem = {
  id: string;
  emoji: string;
  label: string;
  title: string;
  detail: string;
  at: string;
  accent?: string;
  pickPost?: ProfileFeedItem & { type: "pick_post" };
};

function buildMilestones(profile: PublicPlayerProfile): ActivityItem[] {
  const items: ActivityItem[] = [];

  items.push({
    id: "joined",
    emoji: "🎮",
    label: "Joined",
    title: "Joined SquareBoards",
    detail: "Started the competitive journey",
    at: profile.memberSince,
  });

  if (profile.isVerified) {
    items.push({
      id: "verified",
      emoji: "✓",
      label: "Verified",
      title: "Verified Competitor",
      detail: "Identity verified on the platform",
      at: profile.memberSince,
      accent: "text-sky-300",
    });
  }

  for (const achievement of profile.achievements.filter((a) => a.unlocked)) {
    items.push({
      id: `achievement-${achievement.id}`,
      emoji: achievement.emoji,
      label: "Achievement",
      title: achievement.title,
      detail: achievement.description,
      at: profile.memberSince,
      accent: "text-amber-300",
    });
  }

  for (const rank of profile.ranks) {
    items.push({
      id: `rank-${rank.title}`,
      emoji: "🏅",
      label: "Ranking",
      title: `#${rank.rank} on ${rank.title}`,
      detail: "Competition ranking updated",
      at: new Date().toISOString(),
      accent: "text-purple-300",
    });
  }

  return items;
}

function feedToActivity(item: ProfileFeedItem): ActivityItem | null {
  if (item.type === "win") {
    return {
      id: item.id,
      emoji: "🏆",
      label: "Won",
      title: `${item.win.awayTeam} vs ${item.win.homeTeam}`,
      detail: [
        item.win.periodLabel,
        item.win.winningSquare != null ? `Square #${item.win.winningSquare}` : null,
        item.win.amount > 0 ? `$${item.win.amount.toFixed(0)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      at: item.win.wonAt,
      accent: "text-emerald-300",
    };
  }

  if (item.type === "pick_post") {
    return {
      id: item.id,
      emoji: "📋",
      label: "Pick Card",
      title: `Published picks — ${item.post.weekLabel}`,
      detail: `${item.post.picks.length} picks shared to The Huddle`,
      at: item.post.publishedAt,
      pickPost: item,
    };
  }

  if (item.type === "achievement") {
    return {
      id: item.id,
      emoji: item.achievement.emoji,
      label: "Achievement",
      title: item.achievement.title,
      detail: item.achievement.description,
      at: item.at,
      accent: "text-amber-300",
    };
  }

  return null;
}

export default function PlayerActivityFeed({
  profile,
  feed,
  loading = false,
  onPickUpdate,
}: PlayerActivityFeedProps) {
  const milestones = buildMilestones(profile);
  const feedItems = feed.map(feedToActivity).filter((i): i is ActivityItem => Boolean(i));
  const timeline = [...feedItems, ...milestones].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  if (loading) {
    return (
      <div className="text-center py-12 space-y-3" aria-busy="true">
        <div className="sb-xp-skeleton h-24 rounded-2xl max-w-md mx-auto" />
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <AliveEmptyState
        context="no_profile_activity"
        emoji="📜"
        title="No activity yet"
        body={
          profile.isOwner
            ? "Your competition history will begin after your first contest."
            : "This competitor hasn't logged activity yet."
        }
      />
    );
  }

  return (
    <div className="player-timeline space-y-0" role="feed" aria-label="Player activity">
      {timeline.map((item, index) => {
        if (item.pickPost) {
          return (
            <div
              key={item.id}
              className="player-timeline-item admin-stat-enter mb-4"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <PickPostCard post={item.pickPost.post} onUpdate={onPickUpdate ?? (() => undefined)} />
            </div>
          );
        }

        return (
          <div
            key={item.id}
            className="player-timeline-item admin-stat-enter"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="player-timeline-marker">
              <span aria-hidden>{item.emoji}</span>
            </div>
            <LandingGlassCard className="player-timeline-card p-4 flex-1 sb-card-lift">
              <p className={`text-xs uppercase tracking-wider mb-1 ${item.accent ?? "text-sb-glow"}`}>
                {item.label}
              </p>
              <p className="font-semibold text-white">{item.title}</p>
              <p className="text-sm text-sb-muted mt-0.5">{item.detail}</p>
              <time
                className="text-xs text-sb-muted/70 mt-2 block"
                dateTime={item.at}
              >
                {new Date(item.at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              {item.label === "Ranking" ? (
                <Link
                  href="/leaderboards"
                  className="inline-block mt-2 text-xs font-semibold text-sb-glow hover:text-white"
                >
                  View rankings →
                </Link>
              ) : null}
            </LandingGlassCard>
          </div>
        );
      })}
    </div>
  );
}
