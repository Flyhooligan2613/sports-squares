"use client";

import { useEffect, useRef, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { AliveActivityItem } from "@/lib/platform/alive/types";
import { ALIVE_COPY } from "@/lib/platform/language/aliveLanguage";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface LiveActivityFeedProps {
  items: AliveActivityItem[];
  loading?: boolean;
  variant?: "list" | "ticker";
}

export default function LiveActivityFeed({
  items,
  loading,
  variant = "list",
}: LiveActivityFeedProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (variant !== "ticker" || items.length < 2) return;
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [items.length, variant]);

  if (loading) {
    return (
      <LandingGlassCard className="p-4">
        <div className="sb-xp-skeleton h-5 w-32 mb-3" />
        <div className="space-y-2">
          <div className="sb-xp-skeleton h-12 rounded-lg" />
          <div className="sb-xp-skeleton h-12 rounded-lg" />
        </div>
      </LandingGlassCard>
    );
  }

  if (items.length === 0) return null;

  if (variant === "ticker") {
    const current = items[index];
    return (
      <div className="alive-activity-ticker flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04]">
        <span className="sb-live-dot shrink-0" aria-hidden />
        <p className="text-sm text-white truncate">
          <span className="font-semibold">{current.title}</span>
          <span className="text-sb-muted"> · {current.detail}</span>
        </p>
        <span className="text-[10px] text-sb-muted shrink-0">{timeAgo(current.at)}</span>
      </div>
    );
  }

  return (
    <LandingGlassCard className="p-4 sm:p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-3">
        {ALIVE_COPY.activityFeedTitle}
      </h3>
      <ul className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {items.slice(0, 8).map((item) => (
          <li
            key={item.id}
            className={[
              "alive-activity-row flex items-start gap-3 rounded-lg px-3 py-2",
              item.accent === "gold"
                ? "bg-amber-500/5"
                : item.accent === "green"
                  ? "bg-emerald-500/5"
                  : "bg-white/[0.02]",
            ].join(" ")}
          >
            <span className="sb-live-dot mt-1.5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-sb-muted truncate">{item.detail}</p>
            </div>
            <span className="text-[10px] text-sb-muted/70 shrink-0">{timeAgo(item.at)}</span>
          </li>
        ))}
      </ul>
    </LandingGlassCard>
  );
}
