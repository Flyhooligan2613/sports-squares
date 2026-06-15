"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { LegacyTimelineEvent } from "@/lib/competitorCard/types";
import { CONTEST_CTAS } from "@/lib/platform/language";
import { SectionCard, SectionEmpty } from "./shared";

interface LegacyTimelineProps {
  events: LegacyTimelineEvent[];
}

export default function LegacyTimeline({ events }: LegacyTimelineProps) {
  return (
    <SectionCard id="legacy-timeline" title={COMPETITOR_CARD_COPY.legacyTimeline}>
      {events.length === 0 ? (
        <SectionEmpty
          emoji="📜"
          title={COMPETITOR_CARD_COPY.empty.timeline.title}
          body={COMPETITOR_CARD_COPY.empty.timeline.body}
          actionLabel={CONTEST_CTAS.joinTheContest}
          actionHref="/games/nfl"
        />
      ) : (
        <div className="player-timeline space-y-0">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="player-timeline-item admin-stat-enter"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="player-timeline-marker">
                <span aria-hidden>{event.emoji}</span>
              </div>
              <LandingGlassCard className="player-timeline-card p-4 flex-1">
                <p className="font-semibold text-white">{event.title}</p>
                <p className="text-sm text-sb-muted mt-0.5">{event.subtitle}</p>
                <time className="text-xs text-sb-muted/70 mt-2 block" dateTime={event.at}>
                  {new Date(event.at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </LandingGlassCard>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
