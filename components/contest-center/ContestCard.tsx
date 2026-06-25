"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import BoardFillProgress from "@/components/contest-center/BoardFillProgress";
import ContestCountdown from "@/components/contest-center/ContestCountdown";
import ContestJoinButton, { ContestJoinLabel } from "@/components/contest-center/ContestJoinButton";
import ContestStatusBadge from "@/components/contest-center/ContestStatusBadge";
import { TRENDING_LABELS } from "@/lib/contestCenter/labels";
import type { ContestListing } from "@/lib/contestCenter/types";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";
import { contestSpotsLeft } from "@/lib/platform/language";

interface ContestCardProps {
  contest: ContestListing;
  compact?: boolean;
}

export default function ContestCard({ contest, compact = false }: ContestCardProps) {
  const fillPct = contest.fillPercent ?? 0;
  const showFill = fillPct > 0 && contest.status !== "coming_soon";
  const isLive = contest.status === "live";

  return (
    <LandingGlassCard
      className={`cc-contest-card sb-card-lift ${compact ? "cc-contest-card-compact" : ""}`}
      glow={contest.featured || isLive}
      style={{ "--cc-accent": contest.accent } as CSSProperties}
    >
      <div className="cc-contest-card-inner">
        <div className="cc-contest-card-meta">
          <span className="cc-contest-sport">{contest.sport}</span>
          {isLive ? (
            <span className="cc-live-badge" role="status">
              <span className="cc-live-dot" aria-hidden />
              Live
            </span>
          ) : null}
          <ContestStatusBadge status={contest.status} />
        </div>

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
        </div>

        {contest.trendingBadge ? (
          <p className="cc-trending-chip">{TRENDING_LABELS[contest.trendingBadge]}</p>
        ) : null}

        <dl className="cc-contest-stats cc-contest-stats-primary">
          <div className="cc-stat-primary">
            <dt>Entry Fee</dt>
            <dd>{contest.entryFeeLabel}</dd>
          </div>
          {contest.prizePoolLabel ? (
            <div className="cc-stat-primary">
              <dt>Prize Pool</dt>
              <dd className="cc-stat-prize">{contest.prizePoolLabel}</dd>
            </div>
          ) : null}
        </dl>

        <dl className="cc-contest-stats cc-contest-stats-secondary">
          {contest.playersJoined != null ? (
            <div>
              <dt>Participants</dt>
              <dd>{contest.playersJoined.toLocaleString()}</dd>
            </div>
          ) : null}
          {contest.remainingSpots != null ? (
            <div>
              <dt>Spots Remaining</dt>
              <dd>{contestSpotsLeft(contest.remainingSpots)}</dd>
            </div>
          ) : null}
          {contest.gameTimeLabel ? (
            <div>
              <dt>Game Time</dt>
              <dd>{contest.gameTimeLabel}</dd>
            </div>
          ) : null}
          <div>
            <dt>Type</dt>
            <dd>{contest.contestType}</dd>
          </div>
        </dl>

        {contest.kickoffAt || contest.durationLabel ? (
          <ContestCountdown
            kickoffAt={contest.kickoffAt}
            status={contest.status}
            fallbackLabel={contest.durationLabel}
            compact={compact}
            className="cc-contest-countdown"
          />
        ) : null}

        {showFill ? (
          <BoardFillProgress
            fillPercent={fillPct}
            totalSpots={contest.totalSpots ?? 100}
            remainingSpots={contest.remainingSpots}
            accent={contest.accent}
            compact={compact}
          />
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
  const isLive = contest.status === "live";

  return (
    <Link
      href={contest.href}
      className="cc-contest-row sb-card-lift"
      onClick={() => rememberContestJoin(contest.id)}
    >
      <span className="cc-contest-row-emoji" aria-hidden>
        {contest.emoji}
      </span>
      <div className="cc-contest-row-body">
        <p className="cc-contest-row-sport">{contest.sport}</p>
        <p className="cc-contest-row-title">{contest.title}</p>
        <p className="cc-contest-row-meta">
          {[
            contest.entryFeeLabel,
            contest.prizePoolLabel,
            contest.remainingSpots != null
              ? contestSpotsLeft(contest.remainingSpots)
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {isLive ? (
        <span className="cc-live-badge cc-live-badge-sm" role="status">
          <span className="cc-live-dot" aria-hidden />
          Live
        </span>
      ) : (
        <ContestStatusBadge status={contest.status} />
      )}
      <ContestJoinLabel contest={contest} />
    </Link>
  );
}
