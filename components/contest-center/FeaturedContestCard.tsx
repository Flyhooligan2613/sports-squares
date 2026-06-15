"use client";

import type { CSSProperties } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ContestJoinButton from "@/components/contest-center/ContestJoinButton";
import ContestStatusBadge from "@/components/contest-center/ContestStatusBadge";
import { useKickoffCountdown } from "@/lib/motion/useKickoffCountdown";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import type { ContestListing } from "@/lib/contestCenter/types";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";

export default function FeaturedContestCard({ contest }: { contest: ContestListing }) {
  const reducedMotion = useReducedMotion();
  const countdown = useKickoffCountdown(
    contest.kickoffAt ?? new Date(Date.now() + 86_400_000).toISOString(),
    contest.status === "live"
  );

  const fillPct = contest.fillPercent ?? 0;
  const joined = contest.playersJoined ?? 0;
  const spotsLeft = contest.remainingSpots;

  return (
    <LandingGlassCard
      className={`cc-featured-card ${reducedMotion ? "" : "cc-featured-card-animated"}`}
      glow
      style={{ "--cc-accent": contest.accent } as CSSProperties}
    >
      <div className="cc-featured-art" aria-hidden>
        <span className="cc-featured-emoji">{contest.emoji}</span>
        <div className="cc-featured-glow" />
      </div>

      <div className="cc-featured-body">
        <div className="cc-featured-top">
          <p className="cc-featured-kicker">Featured Competition</p>
          <ContestStatusBadge status={contest.status} />
        </div>

        <h2 className="cc-featured-title">{contest.title}</h2>
        {contest.subtitle ? <p className="cc-featured-subtitle">{contest.subtitle}</p> : null}

        <div className="cc-featured-countdown" role="timer" aria-live="polite">
          <span className="cc-featured-countdown-label">
            {countdown.isLive ? "Live Now" : "Starts In"}
          </span>
          <span
            className={[
              "cc-featured-countdown-value",
              countdown.isLive ? "cc-featured-countdown-live" : "",
            ].join(" ")}
          >
            {contest.kickoffAt ? countdown.label : contest.durationLabel}
          </span>
        </div>

        <dl className="cc-featured-stats">
          <div>
            <dt>Entry Fee</dt>
            <dd>{contest.entryFeeLabel}</dd>
          </div>
          <div>
            <dt>Prize Pool</dt>
            <dd>{contest.prizePoolLabel ?? "Growing"}</dd>
          </div>
          <div>
            <dt>Players Joined</dt>
            <dd>{joined > 0 ? joined.toLocaleString() : "Join early"}</dd>
          </div>
          {spotsLeft != null ? (
            <div>
              <dt>Spots Left</dt>
              <dd>{spotsLeft.toLocaleString()}</dd>
            </div>
          ) : null}
        </dl>

        {fillPct > 0 ? (
          <div className="cc-fill-wrap cc-featured-fill">
            <div className="cc-fill-bar">
              <span className="cc-fill-bar-fill" style={{ width: `${fillPct}%` }} />
            </div>
            <span className="cc-fill-label">{fillPct}% of contest filled</span>
          </div>
        ) : null}

        <ContestJoinButton
          contest={contest}
          featured
          className={`cc-featured-join w-full sm:w-auto ${reducedMotion ? "" : "cc-join-btn-pulse"}`}
          onClick={() => rememberContestJoin(contest.id)}
        />
      </div>
    </LandingGlassCard>
  );
}
