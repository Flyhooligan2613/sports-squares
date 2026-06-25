"use client";

import type { CSSProperties } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import BoardFillProgress from "@/components/contest-center/BoardFillProgress";
import ContestCountdown from "@/components/contest-center/ContestCountdown";
import ContestJoinButton from "@/components/contest-center/ContestJoinButton";
import ContestStatusBadge from "@/components/contest-center/ContestStatusBadge";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import type { ContestListing } from "@/lib/contestCenter/types";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";

export default function FeaturedContestCard({ contest }: { contest: ContestListing }) {
  const reducedMotion = useReducedMotion();
  const fillPct = contest.fillPercent ?? 0;
  const joined = contest.playersJoined ?? 0;
  const spotsLeft = contest.remainingSpots;
  const isLive = contest.status === "live";

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
          <div className="cc-featured-kicker-row">
            <p className="cc-featured-kicker">Featured Competition</p>
            <span className="cc-contest-sport">{contest.sport}</span>
          </div>
          <div className="cc-featured-badges">
            {isLive ? (
              <span className="cc-live-badge" role="status">
                <span className="cc-live-dot" aria-hidden />
                Live
              </span>
            ) : null}
            <ContestStatusBadge status={contest.status} />
          </div>
        </div>

        <h2 className="cc-featured-title">{contest.title}</h2>
        {contest.subtitle ? <p className="cc-featured-subtitle">{contest.subtitle}</p> : null}

        <ContestCountdown
          kickoffAt={contest.kickoffAt}
          status={contest.status}
          fallbackLabel={contest.durationLabel}
          className="cc-featured-countdown"
        />

        <dl className="cc-featured-stats">
          <div>
            <dt>Entry Fee</dt>
            <dd>{contest.entryFeeLabel}</dd>
          </div>
          <div>
            <dt>Prize Pool</dt>
            <dd className="cc-stat-prize">{contest.prizePoolLabel ?? "Growing"}</dd>
          </div>
          <div>
            <dt>Participants</dt>
            <dd>{joined > 0 ? joined.toLocaleString() : "Join early"}</dd>
          </div>
          {spotsLeft != null ? (
            <div>
              <dt>Spots Remaining</dt>
              <dd>{spotsLeft.toLocaleString()}</dd>
            </div>
          ) : null}
        </dl>

        {fillPct > 0 ? (
          <BoardFillProgress
            fillPercent={fillPct}
            totalSpots={contest.totalSpots ?? 100}
            remainingSpots={contest.remainingSpots}
            accent={contest.accent}
            className="cc-featured-fill"
          />
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
