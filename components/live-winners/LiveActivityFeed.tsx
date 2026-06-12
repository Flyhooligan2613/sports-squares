"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { getActivityIcon } from "@/lib/liveWinners/display";
import { formatTimeAgo } from "@/lib/liveWinners/format";
import type { LiveActivityItem } from "@/lib/liveWinners/types";

interface LiveActivityFeedProps {
  activity: LiveActivityItem[];
}

export default function LiveActivityFeed({ activity }: LiveActivityFeedProps) {
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Live Activity</h2>

      {activity.length === 0 ? (
        <LandingGlassCard className="p-6 text-center">
          <p className="text-sb-muted text-sm">Platform activity will stream here.</p>
        </LandingGlassCard>
      ) : (
        <LandingGlassCard className="p-3 sm:p-4">
          <ul className="space-y-1">
            {activity.map((item, index) => (
              <li
                key={item.id}
                className="lwc-activity-item admin-stat-enter"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className="lwc-activity-icon" aria-hidden>
                  {getActivityIcon(item.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-sb-muted truncate">{item.detail}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-sb-muted/80 shrink-0">
                  {formatTimeAgo(item.at)}
                </span>
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      )}
    </section>
  );
}
