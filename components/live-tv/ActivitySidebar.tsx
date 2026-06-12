"use client";

import { useEffect, useRef } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatTimeAgo } from "@/lib/liveWinners/format";
import type { LiveTvStreamEvent } from "@/lib/liveTv/types";

interface ActivitySidebarProps {
  feed: LiveTvStreamEvent[];
}

const ICONS: Partial<Record<LiveTvStreamEvent["type"], string>> = {
  purchase: "💳",
  join: "👋",
  fill_milestone: "📈",
  board_created: "🚀",
  sold_out: "🔥",
  kickoff: "🏈",
  winner: "🏆",
  payout: "💰",
  numbers_assigned: "🎲",
  board_locked: "🔒",
  quarter_end: "⏱️",
  touchdown: "🏈",
};

export default function ActivitySidebar({ feed }: ActivitySidebarProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [feed[0]?.id]);

  return (
    <aside className="livetv-sidebar">
      <h2 className="livetv-section-title">Live Feed</h2>
      <LandingGlassCard className="livetv-sidebar-panel p-2 sm:p-3 flex-1">
        <ul ref={listRef} className="livetv-sidebar-scroll space-y-1">
          {feed.length === 0 ? (
            <li className="text-sb-muted text-sm text-center py-6">Feed loading…</li>
          ) : (
            feed.map((item, index) => (
              <li
                key={item.id}
                className={[
                  "livetv-sidebar-item",
                  index === 0 ? "livetv-sidebar-item-new" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="livetv-sidebar-icon">{ICONS[item.type] ?? "⚡"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-sb-muted truncate">{item.detail}</p>
                </div>
                <span className="text-[10px] text-sb-muted shrink-0">
                  {formatTimeAgo(item.at)}
                </span>
              </li>
            ))
          )}
        </ul>
      </LandingGlassCard>
    </aside>
  );
}
