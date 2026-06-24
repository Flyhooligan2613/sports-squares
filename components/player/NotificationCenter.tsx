"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import { Button } from "@/components/ui/Button";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";
import {
  loadReadNotificationIds,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/notifications/readState";
import { getPlayerSessionUser } from "@/lib/auth/playerAuthClient";
import { formatUserError } from "@/lib/errors/formatUserError";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "rewards", label: "Rewards" },
  { id: "wallet", label: "Wallet" },
  { id: "community", label: "Community" },
  { id: "contests", label: "Contests" },
  { id: "system", label: "System" },
] as const;

type NotificationFilter = (typeof FILTER_TABS)[number]["id"];

function notificationCategory(type: PlayerNotification["type"]): NotificationFilter {
  if (type === "payment_sent" || type === "pickem_payout") return "wallet";
  if (
    type === "pickem_achievement" ||
    type === "pickem_streak" ||
    type === "pickem_rank_up" ||
    type === "quarter_winner" ||
    type === "pickem_winner"
  ) {
    return "rewards";
  }
  if (type === "platform_announcement") return "community";
  return "contests";
}

const ICONS: Record<PlayerNotification["type"], string> = {
  board_filled: "📋",
  numbers_assigned: "🎯",
  quarter_winner: "🏆",
  payment_sent: "💰",
  game_starting: "🏈",
  pickem_week_open: "🏈",
  pickem_pool_almost_full: "🔥",
  pickem_pool_full: "✅",
  pickem_sunday_complete: "📊",
  pickem_championship: "👑",
  pickem_prediction_due: "⏱",
  pickem_prediction_locked: "🔒",
  pickem_winner: "🏆",
  pickem_payout: "💰",
  pickem_streak: "🔥",
  pickem_rank_up: "📈",
  pickem_achievement: "⭐",
  platform_announcement: "📣",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<PlayerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const user = await getPlayerSessionUser();
        if (!user?.email) {
          if (!cancelled) setError("Sign in to view notifications.");
          return;
        }

        if (!cancelled) {
          setEmail(user.email);
          setReadIds(loadReadNotificationIds(user.email));
        }

        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load notifications");
        }

        const data = (await res.json()) as { notifications: PlayerNotification[] };
        if (!cancelled) setNotifications(data.notifications ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(formatUserError(err, "load"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.includes(item.id)).length,
    [notifications, readIds]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "system") {
      return notifications.filter((item) => item.type === "platform_announcement");
    }
    return notifications.filter((item) => notificationCategory(item.type) === filter);
  }, [notifications, filter]);

  function handleMarkRead(id: string) {
    if (!email) return;
    const next = markNotificationsRead(email, [id]);
    setReadIds(next);
  }

  function handleMarkAllRead() {
    if (!email) return;
    const next = markAllNotificationsRead(
      email,
      notifications.map((item) => item.id)
    );
    setReadIds(next);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-3">
        <div className="sb-xp-skeleton h-10 w-48" />
        <div className="sb-xp-skeleton h-24" />
        <div className="sb-xp-skeleton h-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <LandingGlassCard className="p-8">
          <p className="text-white font-semibold mb-2">{error}</p>
          <Button href="/my-games/login">Sign in</Button>
        </LandingGlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            Notifications
          </h1>
          <p className="text-sb-muted">
            Wins, payouts, kickoffs, and board updates — all in one place.
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-sb-glow hover:text-white transition-colors shrink-0"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={[
              "shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors",
              filter === tab.id
                ? "bg-white/10 border-white/20 text-white"
                : "border-transparent text-sb-muted hover:text-white hover:bg-white/5",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {notifications.length === 0 ? (
        <AliveEmptyState context="no_notifications" emoji="🔔" />
      ) : filteredNotifications.length === 0 ? (
        <LandingGlassCard glow className="p-6 text-center">
          <p className="text-white font-semibold mb-1">No notifications in this category</p>
          <p className="text-sm text-sb-muted mb-4">
            Try another filter — wins, payouts, and alerts are organized by type.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="text-xs font-semibold text-sb-glow hover:text-white transition-colors"
          >
            Show all
          </button>
        </LandingGlassCard>
      ) : (
        <ul className="space-y-3">
          {filteredNotifications.map((item, index) => {
            const unread = !readIds.includes(item.id);
            return (
              <li key={item.id}>
                <LandingGlassCard
                  className={[
                    "p-4 sm:p-5 sb-stagger-item",
                    unread ? "border-sb-glow/25" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                  onClick={() => handleMarkRead(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleMarkRead(item.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        "player-notification-icon",
                        unread ? "sb-notif-unread-pulse" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden
                    >
                      {ICONS[item.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        {unread ? (
                          <span className="sb-notif-dot" aria-label="Unread" />
                        ) : null}
                      </div>
                      <p className="text-xs text-sb-muted leading-relaxed">{item.detail}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-sb-muted/70 shrink-0">
                      {timeAgo(item.at)}
                    </span>
                  </div>
                </LandingGlassCard>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-center text-xs text-sb-muted mt-8">
        Prefer the full dashboard?{" "}
        <Link href="/my-games" className="text-sb-glow hover:text-white transition-colors">
          Open My Games
        </Link>
      </p>
    </div>
  );
}
