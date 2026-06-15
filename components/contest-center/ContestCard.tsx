"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ContestJoinButton, { ContestJoinLabel } from "@/components/contest-center/ContestJoinButton";
import ContestStatusBadge from "@/components/contest-center/ContestStatusBadge";
import { TRENDING_LABELS } from "@/lib/contestCenter/labels";
import type { ContestListing } from "@/lib/contestCenter/types";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";

interface ContestCardProps {
  contest: ContestListing;
  compact?: boolean;
}

export default function ContestCard({ contest, compact = false }: ContestCardProps) {
  const fillPct = contest.fillPercent ?? 0;
  const showFill = fillPct > 0 && contest.status !== "coming_soon";

  return (
    <LandingGlassCard
      className={`cc-contest-card ${compact ? "cc-contest-card-compact" : ""}`}
      glow={contest.featured}
      style={{ "--cc-accent": contest.accent } as CSSProperties}
    >
      <div className="cc-contest-card-inner">
        <div className="cc-contest-card-head">
          <span className="cc-contest-emoji" aria-hidden>
            {contest.emoji}
          </span>
          <div className="cc-contest-head-text">
            <h3 className="cc-contest-title">{contest.title}</h3>
            {contest.subtitle ? (
              <p className="cc-contest-subtitle">{contest.subtitle}</p>
            ) : null}
          </div>
          <ContestStatusBadge status={contest.status} />
        </div>

        {contest.trendingBadge ? (
          <p className="cc-trending-chip">{TRENDING_LABELS[contest.trendingBadge]}</p>
        ) : null}

        <dl className="cc-contest-stats">
          {contest.gameTimeLabel ? (
            <div>
              <dt>Game Time</dt>
              <dd>{contest.gameTimeLabel}</dd>
            </div>
          ) : null}
          <div>
            <dt>Entry Fee</dt>
            <dd>{contest.entryFeeLabel}</dd>
          </div>
          {contest.playersJoined != null ? (
            <div>
              <dt>Players</dt>
              <dd>{contest.playersJoined.toLocaleString()}</dd>
            </div>
          ) : null}
          {contest.prizePoolLabel ? (
            <div>
              <dt>Prize Pool</dt>
              <dd>{contest.prizePoolLabel}</dd>
            </div>
          ) : null}
          {contest.remainingSpots != null ? (
            <div>
              <dt>Spots Left</dt>
              <dd>{contest.remainingSpots.toLocaleString()}</dd>
            </div>
          ) : null}
          <div>
            <dt>Type</dt>
            <dd>{contest.contestType}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{contest.durationLabel}</dd>
          </div>
        </dl>

        {showFill ? (
          <div className="cc-fill-wrap" aria-hidden>
            <div className="cc-fill-bar">
              <span className="cc-fill-bar-fill" style={{ width: `${fillPct}%` }} />
            </div>
            <span className="cc-fill-label">{fillPct}% full</span>
          </div>
        ) : null}

        <ContestJoinButton
          contest={contest}
          fullWidth
          className="cc-join-btn"
          onClick={() => rememberContestJoin(contest.id)}
        />
      </div>
    </LandingGlassCard>
  );
}

export function ContestCardRow({ contest }: { contest: ContestListing }) {
  return (
    <Link
      href={contest.href}
      className="cc-contest-row"
      onClick={() => rememberContestJoin(contest.id)}
    >
      <span className="cc-contest-row-emoji" aria-hidden>
        {contest.emoji}
      </span>
      <div className="cc-contest-row-body">
        <p className="cc-contest-row-title">{contest.title}</p>
        <p className="cc-contest-row-meta">
          {[contest.gameTimeLabel, contest.entryFeeLabel, contest.contestType]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <ContestStatusBadge status={contest.status} />
      <ContestJoinLabel contest={contest} />
    </Link>
  );
}
