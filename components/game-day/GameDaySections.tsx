"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import HubSectionLink from "@/components/home/HubSectionLink";
import { HUB_SECTION, hubSectionAnchorClassName } from "@/lib/home/hubSections";
import type { GameDayTimelineSection } from "@/lib/gameDay/types";

const KIND_ICONS: Record<string, string> = {
  board_open: "📋",
  kickoff: "🏈",
  quarter_winner: "🏆",
  halftime: "🏆",
  final: "🏁",
  payout: "💰",
};

export default function GameDayTimeline({ sections }: { sections: GameDayTimelineSection[] }) {
  const active = sections.find((s) => s.active) ?? sections[0];

  return (
    <section id={HUB_SECTION.timeline} className={hubSectionAnchorClassName("mb-10 sm:mb-12")}>
      <h2 className="gd-section-title">Game Day Timeline</h2>
      <div className="gd-timeline-phases mb-4">
        {sections.map((section) => (
          <span
            key={section.phase}
            className={[
              "gd-timeline-phase-pill",
              section.active ? "gd-timeline-phase-pill-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {section.emoji} {section.label}
          </span>
        ))}
      </div>
      <LandingGlassCard className="p-4 sm:p-5">
        {active.events.length === 0 ? (
          <p className="text-sm text-sb-muted text-center py-6">
            {active.phase === "morning"
              ? "Upcoming games, open boards, and reward opportunities will appear here."
              : active.phase === "afternoon"
                ? "Live scores and board activity will roll in as games kick off."
                : active.phase === "evening"
                  ? "Winners, rewards, and achievements show up here after games conclude."
                  : "Your Game Day recap and tomorrow's opportunities land here tonight."}
          </p>
        ) : (
          <ol className="ac-timeline">
            {active.events.map((event, index) => (
              <li
                key={event.id}
                className="ac-timeline-item admin-stat-enter"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="ac-timeline-marker">
                  <span aria-hidden>{KIND_ICONS[event.kind] ?? "•"}</span>
                </div>
                <div className="ac-timeline-content">
                  <p className="text-xs font-bold text-sb-glow tabular-nums">{event.timeLabel}</p>
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

export function GameDayLiveStrip({
  items,
  title = "Live Activity",
}: {
  items: { id: string; emoji: string; message: string }[];
  title?: string;
}) {
  if (!items.length) return null;

  return (
    <section id={HUB_SECTION.liveActivity} className={hubSectionAnchorClassName("mb-10 sm:mb-12")}>
      <h2 className="gd-section-title home-section-title">{title}</h2>
      <div className="gd-live-strip">
        {items.slice(0, 8).map((item) => (
          <span key={item.id} className="gd-live-strip-item">
            <span aria-hidden>{item.emoji}</span> {item.message}
          </span>
        ))}
      </div>
    </section>
  );
}

export function GameDayMissionsPanel({
  missions,
}: {
  missions: import("@/lib/gameDay/types").GameDayMission[];
}) {
  const completed = missions.filter((m) => m.completed).length;

  return (
    <section id={HUB_SECTION.missions} className={hubSectionAnchorClassName("mb-10 sm:mb-12")}>
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="gd-section-title mb-0">Game Day Missions</h2>
        <span className="text-xs text-sb-muted tabular-nums">
          {completed}/{missions.length} complete
        </span>
      </div>
      <ul className="space-y-3">
        {missions.map((mission) => (
          <li key={mission.id}>
            <HubSectionLink
              href={mission.href}
              className={[
                "gd-mission-card block",
                mission.completed ? "gd-mission-card-done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>
                  {mission.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{mission.title}</p>
                  <p className="text-xs text-sb-muted mt-0.5">{mission.description}</p>
                  {mission.progress && !mission.completed ? (
                    <div className="gd-mission-progress mt-2">
                      <div
                        className="gd-mission-progress-fill"
                        style={{
                          width: `${Math.round((mission.progress.current / mission.progress.target) * 100)}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <span className="text-[10px] uppercase tracking-wide text-sb-glow shrink-0">
                  {mission.completed ? "Done" : mission.rewardLabel}
                </span>
              </div>
            </HubSectionLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GameDayWhatsNextPanel({
  items,
}: {
  items: import("@/lib/gameDay/types").GameDayWhatsNextItem[];
}) {
  if (!items.length) return null;

  return (
    <section id={HUB_SECTION.whatsNext} className={hubSectionAnchorClassName("mb-10 sm:mb-12")}>
      <h2 className="gd-section-title">What&apos;s Next?</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <HubSectionLink href={item.href} className="gd-whats-next-card block">
              <span className="text-xl" aria-hidden>
                {item.emoji}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-sb-muted mt-0.5">{item.reason}</p>
              </div>
            </HubSectionLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
