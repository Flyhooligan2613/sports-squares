"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import CommandCenterSyncBanner from "@/components/admin/commandCenter/CommandCenterSyncBanner";
import { ACTIVITY_FEED_POLL_MS, type ActivityFeedItem } from "@/lib/platform/engines/commandCenter";
import { getDemoActivityFeed } from "@/lib/platform/engines/commandCenter/mockData";
import { COMMAND_CENTER_API_TIMEOUT_MS } from "@/lib/platform/engines/commandCenter/config";
import { fetchCommandCenter } from "@/hooks/useCommandCenterHydration";

const CATEGORY_COLORS: Record<string, string> = {
  contest: "text-sb-glow bg-sb-purple/10 border-sb-purple/25",
  payment: "text-sb-success bg-sb-success/10 border-sb-success/25",
  reward: "text-sb-gold bg-sb-gold/10 border-sb-gold/25",
  community: "text-sb-secondary bg-white/5 border-white/10",
  support: "text-blue-300 bg-blue-500/10 border-blue-500/25",
  fraud: "text-red-300 bg-red-500/10 border-red-500/25",
  system: "text-sb-muted bg-white/5 border-white/10",
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

function parseActivity(body: Record<string, unknown>) {
  if (Array.isArray(body.items)) {
    return {
      value: body.items as ActivityFeedItem[],
      demo: Boolean(body.demo),
    };
  }
  return null;
}

function ActivityRow({ item }: { item: ActivityFeedItem }) {
  const badgeClass = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.system;
  return (
    <div className="flex gap-3 py-3 border-b border-white/[0.06] last:border-0">
      <time className="text-[11px] text-sb-muted tabular-nums shrink-0 pt-0.5 w-16">
        {formatTime(item.createdAt)}
      </time>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 border ${badgeClass}`}
          >
            {item.category}
          </span>
          {item.severity !== "info" && (
            <span
              className={`text-[10px] uppercase font-semibold ${
                item.severity === "critical" ? "text-red-400" : "text-amber-400"
              }`}
            >
              {item.severity}
            </span>
          )}
        </div>
        <p className="text-sm text-white font-medium">{item.title}</p>
        <p className="text-xs text-sb-muted mt-0.5">{item.summary}</p>
      </div>
    </div>
  );
}

export default function ActivityFeedPanel() {
  const [items, setItems] = useState<ActivityFeedItem[]>(getDemoActivityFeed());
  const [hydrating, setHydrating] = useState(true);
  const [usingDemo, setUsingDemo] = useState(true);

  async function load(showHydrating = false) {
    if (showHydrating) setHydrating(true);
    const parsed = await fetchCommandCenter(
      "/api/admin/command-center/activity?limit=30",
      parseActivity,
      COMMAND_CENTER_API_TIMEOUT_MS
    );
    if (parsed) {
      setItems(parsed.value);
      setUsingDemo(parsed.demo);
    }
    setHydrating(false);
  }

  useEffect(() => {
    void load(true);
    const timer = setInterval(() => void load(false), ACTIVITY_FEED_POLL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <LandingGlassCard className="p-4 sm:p-5 sb-card-lift">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Live Activity Feed</h2>
        <span className="flex items-center gap-1.5 text-xs text-sb-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-sb-success animate-pulse" />
          Polling
        </span>
      </div>

      {(hydrating || usingDemo) && (
        <div className="mb-4">
          <CommandCenterSyncBanner hydrating={hydrating} usingDemo={!hydrating && usingDemo} />
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-sb-muted text-center py-8">No recent activity.</p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto pr-1">
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </LandingGlassCard>
  );
}
