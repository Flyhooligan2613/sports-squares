"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatTimeAgo } from "@/lib/liveWinners/format";
import type { LiveTvStreamEvent } from "@/lib/liveTv/types";

interface LivePurchaseStreamProps {
  events: LiveTvStreamEvent[];
}

export default function LivePurchaseStream({ events }: LivePurchaseStreamProps) {
  const items = events.length < 8 ? [...events, ...events] : events;

  return (
    <section>
      <h2 className="livetv-section-title">Live Activity Stream</h2>
      <LandingGlassCard className="livetv-stream-panel overflow-hidden p-2">
        <div className="livetv-stream-track">
          {items.map((event, index) => (
            <span key={`${event.id}-${index}`} className="livetv-stream-item">
              <span className="livetv-stream-dot" />
              {event.title}
              <span className="text-sb-muted">· {formatTimeAgo(event.at)}</span>
            </span>
          ))}
        </div>
      </LandingGlassCard>
    </section>
  );
}
