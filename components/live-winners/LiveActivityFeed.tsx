"use client";

import { useEffect, useRef } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { getActivityAccent, getActivityIcon } from "@/lib/liveWinners/display";
import { formatTimeAgo } from "@/lib/liveWinners/format";
import type { LiveActivityItem } from "@/lib/liveWinners/types";

interface LiveActivityFeedProps {
  activity: LiveActivityItem[];
  showHeader?: boolean;
  title?: string;
}

function accentClass(
  accent?: "green" | "blue" | "purple" | "gold" | "yellow" | "red"
): string {
  if (accent === "green") return "lwc-activity-accent-green";
  if (accent === "blue") return "lwc-activity-accent-blue";
  if (accent === "purple") return "lwc-activity-accent-purple";
  if (accent === "gold") return "lwc-activity-accent-gold";
  if (accent === "yellow") return "lwc-activity-accent-yellow";
  if (accent === "red") return "lwc-activity-accent-red";
  return "";
}

export default function LiveActivityFeed({
  activity,
  showHeader = true,
  title = "Live Activity",
}: LiveActivityFeedProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const prevTopIdRef = useRef<string | null>(null);

  useEffect(() => {
    const topId = activity[0]?.id ?? null;
    if (!topId || topId === prevTopIdRef.current) {
      prevTopIdRef.current = topId;
      return;
    }

    prevTopIdRef.current = topId;
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activity]);

  return (
    <section className="lwc-activity-section">
      {showHeader && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
          <span className="lwc-activity-live-dot" aria-hidden />
        </div>
      )}

      {activity.length === 0 ? (
        <LandingGlassCard className="p-6">
          <SectionEmptyState
            emoji="📡"
            title="Platform activity warming up"
            description="Purchases, winners, and payouts stream here in real time."
            compact
          />
        </LandingGlassCard>
      ) : (
        <LandingGlassCard className="lwc-activity-panel p-2 sm:p-3">
          <ul ref={listRef} className="lwc-activity-scroll space-y-1">
            {activity.map((item, index) => (
              <li
                key={item.id}
                className={[
                  "lwc-activity-event admin-stat-enter",
                  accentClass(item.accent ?? getActivityAccent(item.type)),
                  index === 0 ? "lwc-activity-event-new" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
              >
                <span className="lwc-activity-icon" aria-hidden>
                  {getActivityIcon(item.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-sb-muted truncate">{item.detail}</p>
                </div>
                <span className="lwc-activity-time">{formatTimeAgo(item.at)}</span>
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      )}
    </section>
  );
}
