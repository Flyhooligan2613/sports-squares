"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import type { TimelineEvent } from "@/lib/actionCenter/types";

interface TodaysTimelineProps {
  events: TimelineEvent[];
}

const KIND_ICONS: Record<TimelineEvent["kind"], string> = {
  board_open: "📋",
  kickoff: "🏈",
  quarter_winner: "🏆",
  halftime: "🏆",
  final: "🏁",
  payout: "💰",
};

export default function TodaysTimeline({ events }: TodaysTimelineProps) {
  return (
    <section>
      <h2 className="ac-section-title">Today&apos;s Timeline</h2>
      <LandingGlassCard className="p-4 sm:p-5">
        {events.length === 0 ? (
          <SectionEmptyState
            emoji="🗓️"
            title="Today's timeline is warming up"
            description="Kickoffs, quarter winners, and payouts will appear here as the day unfolds."
            compact
          />
        ) : (
          <ol className="ac-timeline">
            {events.map((event, index) => (
              <li
                key={event.id}
                className="ac-timeline-item admin-stat-enter"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="ac-timeline-marker">
                  <span aria-hidden>{KIND_ICONS[event.kind]}</span>
                </div>
                <div className="ac-timeline-content">
                  <p className="text-xs font-bold text-sb-glow tabular-nums">
                    {event.timeLabel}
                  </p>
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  {event.detail ? (
                    <p className="text-xs text-sb-muted mt-0.5">{event.detail}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </LandingGlassCard>
    </section>
  );
}
