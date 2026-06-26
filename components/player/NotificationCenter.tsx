"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Search, Trash2, X } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import NotificationHubShell from "@/components/player/NotificationHubShell";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";
import {
  archiveNotifications,
  deleteNotifications,
  loadArchivedNotificationIds,
  loadDeletedNotificationIds,
  loadReadNotificationIds,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/notifications/readState";
import {
  getNotificationCategory,
  getNotificationDisplayMeta,
  matchesNotificationSearch,
  NOTIFICATION_CATEGORY_TABS,
  type NotificationCategory,
} from "@/lib/notifications/notificationMeta";
import {
  isCategoryEnabled,
  loadNotificationPreferences,
} from "@/lib/notifications/preferenceState";
import { getPlayerSessionUser } from "@/lib/auth/playerAuthClient";
import { formatUserError } from "@/lib/errors/formatUserError";
import { useNavDrawerSafe } from "@/components/nav/NavDrawerProvider";

type FilterId = (typeof NOTIFICATION_CATEGORY_TABS)[number]["id"];

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
  const nav = useNavDrawerSafe();
  const [notifications, setNotifications] = useState<PlayerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

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
          setArchivedIds(loadArchivedNotificationIds(user.email));
          setDeletedIds(loadDeletedNotificationIds(user.email));
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

  const prefs = useMemo(
    () => (email ? loadNotificationPreferences(email) : null),
    [email, notifications.length]
  );

  const visibleNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (deletedIds.includes(item.id)) return false;
      const archived = archivedIds.includes(item.id);
      if (showArchived) return archived;
      return !archived;
    });
  }, [notifications, deletedIds, archivedIds, showArchived]);

  const unreadCount = useMemo(
    () => visibleNotifications.filter((item) => !readIds.includes(item.id)).length,
    [visibleNotifications, readIds]
  );

  const filteredNotifications = useMemo(() => {
    return visibleNotifications.filter((item) => {
      const category = getNotificationCategory(item.type);
      if (prefs && !isCategoryEnabled(prefs, category)) return false;
      if (filter !== "all" && category !== filter) return false;
      return matchesNotificationSearch(item, search);
    });
  }, [visibleNotifications, filter, search, prefs]);

  function refreshNavBadge() {
    void nav?.refreshUserContext();
  }

  function handleMarkRead(id: string) {
    if (!email) return;
    setMarkingId(id);
    window.setTimeout(() => {
      const next = markNotificationsRead(email, [id]);
      setReadIds(next);
      setMarkingId(null);
      refreshNavBadge();
    }, 180);
  }

  function handleMarkAllRead() {
    if (!email) return;
    const next = markAllNotificationsRead(
      email,
      visibleNotifications.map((item) => item.id)
    );
    setReadIds(next);
    refreshNavBadge();
  }

  function handleArchive(id: string) {
    if (!email) return;
    const next = archiveNotifications(email, [id]);
    setArchivedIds(next);
    handleMarkRead(id);
  }

  function handleDelete(id: string) {
    if (!email) return;
    const next = deleteNotifications(email, [id]);
    setDeletedIds(next);
    refreshNavBadge();
  }

  if (loading) {
    return (
      <NotificationHubShell
        title="Notifications"
        subtitle="Wins, payouts, kickoffs, and board updates — all in one place."
      >
        <div className="space-y-3" aria-busy="true">
          <div className="sb-xp-skeleton h-10 w-48" />
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
        title="Notifications"
        subtitle="Wins, payouts, kickoffs, and board updates — all in one place."
      >
        <LandingGlassCard className="p-8 text-center">
          <p className="text-white font-semibold mb-2">{error}</p>
          <p className="text-sm text-sb-muted mb-6">
            Sign in to see wins, payouts, and game-day alerts.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/my-games/login"
              className="inline-flex items-center min-h-[44px] px-4 rounded-xl bg-sb-glow text-white text-sm font-semibold"
            >
              Sign in
            </Link>
            <Link
              href="/contest-center"
              className="inline-flex items-center min-h-[44px] px-4 rounded-xl text-sm font-semibold text-sb-muted hover:text-white"
            >
              Browse contests
            </Link>
          </div>
        </LandingGlassCard>
      </NotificationHubShell>
    );
  }

  return (
    <NotificationHubShell
      title="Notifications"
      subtitle="Wins, payouts, kickoffs, and board updates — all in one place."
      actions={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-sb-glow hover:text-white transition-colors duration-[250ms] shrink-0 min-h-[44px] px-2"
          >
            Mark all read
          </button>
        ) : null
      }
    >
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sb-muted pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notifications…"
          aria-label="Search notifications"
          className="w-full min-h-[44px] pl-10 pr-10 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-sb-muted/70 focus:outline-none focus:ring-2 focus:ring-sb-glow/30 transition-all duration-[250ms]"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-sb-muted hover:text-white"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none flex-1"
          role="tablist"
          aria-label="Filter by category"
        >
          {NOTIFICATION_CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={[
                "notification-category-tab shrink-0 text-xs px-3 py-2 rounded-full border min-h-[36px] transition-all duration-[250ms]",
                filter === tab.id
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-transparent text-sb-muted hover:text-white hover:bg-white/5",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className={[
            "shrink-0 text-xs font-semibold min-h-[36px] px-3 rounded-full border transition-all duration-[250ms]",
            showArchived
              ? "border-sb-glow/40 text-white bg-white/10"
              : "border-white/10 text-sb-muted hover:text-white",
          ].join(" ")}
          aria-pressed={showArchived}
        >
          Archived
        </button>
      </div>

      {visibleNotifications.length === 0 && !showArchived ? (
        <AliveEmptyState
          context="no_notifications"
          emoji="🔔"
          title="You're all caught up"
          body="We'll notify you when something important happens."
        />
      ) : filteredNotifications.length === 0 ? (
        <LandingGlassCard glow className="p-6 text-center">
          <p className="text-white font-semibold mb-1">
            {showArchived ? "No archived notifications" : "No notifications in this view"}
          </p>
          <p className="text-sm text-sb-muted mb-4">
            {search
              ? "Try a different search term or category."
              : "Try another filter — wins, payouts, and alerts are organized by type."}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setSearch("");
              setShowArchived(false);
            }}
            className="text-xs font-semibold text-sb-glow hover:text-white transition-colors duration-[250ms] min-h-[44px] px-3"
          >
            Show all
          </button>
        </LandingGlassCard>
      ) : (
        <ul className="space-y-3" role="list">
          {filteredNotifications.map((item, index) => {
            const unread = !readIds.includes(item.id);
            const meta = getNotificationDisplayMeta(item, {
              isRead: !unread,
              isArchived: archivedIds.includes(item.id),
            });
            const isMarking = markingId === item.id;

            return (
              <li key={item.id}>
                <LandingGlassCard
                  className={[
                    "p-4 sm:p-5 sb-stagger-item sb-card-lift transition-all duration-[250ms]",
                    unread ? "border-sb-glow/25" : "",
                    isMarking ? "sb-notif-mark-read" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
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
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        {unread ? (
                          <span className="sb-notif-dot" aria-label="Unread" />
                        ) : null}
                        <span className="text-[10px] uppercase tracking-wide text-sb-muted/60 ml-auto sm:ml-0">
                          {meta.status}
                        </span>
                      </div>
                      <p className="text-xs text-sb-muted leading-relaxed">{item.detail}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {meta.ctaHref && meta.ctaLabel ? (
                          <Link
                            href={meta.ctaHref}
                            onClick={() => unread && handleMarkRead(item.id)}
                            className="inline-flex items-center min-h-[44px] text-xs font-semibold text-sb-glow hover:text-white transition-colors duration-[250ms]"
                          >
                            {meta.ctaLabel} →
                          </Link>
                        ) : null}
                        {unread ? (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(item.id)}
                            className="inline-flex items-center min-h-[44px] text-xs font-semibold text-sb-muted hover:text-white transition-colors duration-[250ms]"
                            aria-label={`Mark ${item.title} as read`}
                          >
                            Mark read
                          </button>
                        ) : null}
                        {!showArchived ? (
                          <button
                            type="button"
                            onClick={() => handleArchive(item.id)}
                            className="inline-flex items-center gap-1 min-h-[44px] text-xs text-sb-muted hover:text-white transition-colors duration-[250ms]"
                            aria-label={`Archive ${item.title}`}
                          >
                            <Archive className="w-3.5 h-3.5" aria-hidden />
                            Archive
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 min-h-[44px] text-xs text-sb-muted hover:text-red-300 transition-colors duration-[250ms]"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden />
                          Delete
                        </button>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-sb-muted/70 shrink-0">
                      {timeAgo(item.at)}
                    </span>
                  </div>
                  <p className="sr-only">
                    Category: {meta.category as NotificationCategory}
                  </p>
                </LandingGlassCard>
              </li>
            );
          })}
        </ul>
      )}
    </NotificationHubShell>
  );
}
