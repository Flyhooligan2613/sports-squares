"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { ACTIVITY_FEED_POLL_MS, type ActivityFeedItem } from "@/lib/platform/engines/commandCenter";

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
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/admin/command-center/activity?limit=30");
      if (res.ok) {
        const data = (await res.json()) as { items: ActivityFeedItem[] };
        setItems(data.items);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, ACTIVITY_FEED_POLL_MS);
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

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
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
