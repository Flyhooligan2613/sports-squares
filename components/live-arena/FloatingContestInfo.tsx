"use client";

import type { LiveContest } from "@/lib/live-arena/types";

interface FloatingContestInfoProps {
  contest: LiveContest;
  quarter: number;
  clock: string;
  winningDisplayNumber: string;
  potentialPrize: number;
  visible: boolean;
}

const Q_LABELS: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
};

export default function FloatingContestInfo({
  contest,
  quarter,
  clock,
  winningDisplayNumber,
  potentialPrize,
  visible,
}: FloatingContestInfoProps) {
  if (!visible) return null;

  return (
    <aside
      className="la-floating-info la-glass-card la-ui-breathe"
      aria-label="Contest information"
    >
      <p className="la-floating-info__title truncate">
        {contest.awayAbbr} vs {contest.homeAbbr}
      </p>
      <dl className="la-floating-info__grid">
        <div>
          <dt>Quarter</dt>
          <dd>{Q_LABELS[quarter] ?? `Q${quarter}`}</dd>
        </div>
        <div>
          <dt>Clock</dt>
          <dd className="tabular-nums">{clock}</dd>
        </div>
        <div>
          <dt>Winning Sq</dt>
          <dd className="la-floating-info__win">
            <span className="la-win-pattern" aria-hidden />
            {winningDisplayNumber}
          </dd>
        </div>
        <div>
          <dt>Prize</dt>
          <dd className="tabular-nums text-sb-gold">
            ${potentialPrize.toLocaleString()}
          </dd>
        </div>
      </dl>
      <p className="la-floating-info__type">{contest.contestType}</p>
    </aside>
  );
}
