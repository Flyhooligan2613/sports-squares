import Link from "next/link";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { PlayerRecentWin } from "@/lib/player/dashboardTypes";

interface RecentWinsTimelineProps {
  wins: PlayerRecentWin[];
}

function payoutLabel(status: PlayerRecentWin["payoutStatus"]): string {
  if (status === "paid") return "Paid";
  if (status === "pending") return "Payout processing";
  return "Payout pending setup";
}

function formatWinDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecentWinsTimeline({ wins }: RecentWinsTimelineProps) {
  if (wins.length === 0) {
    return <AliveEmptyState context="no_contest_history" emoji="🏆" />;
  }

  return (
    <div className="player-timeline space-y-0">
      {wins.map((win, index) => (
        <div
          key={win.id}
          className="player-timeline-item admin-stat-enter"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div className="player-timeline-marker">
            <span aria-hidden>🏆</span>
          </div>
          <LandingGlassCard className="player-timeline-card player-history-card p-4 sm:p-5 flex-1 sb-card-lift">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-sb-glow mb-1">
                  {win.sport} · Win
                </p>
                <p className="text-base sm:text-lg font-bold text-white">
                  {win.awayTeam} vs {win.homeTeam}
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-sb-success tabular-nums shrink-0">
                +${win.amount.toLocaleString()}
              </p>
            </div>

            <dl className="player-history-grid grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm mb-4">
              <div>
                <dt className="player-history-label">Result</dt>
                <dd className="text-white font-medium">Won {win.periodLabel}</dd>
              </div>
              <div>
                <dt className="player-history-label">Placement</dt>
                <dd className="text-white font-medium">Quarter Winner</dd>
              </div>
              <div>
                <dt className="player-history-label">Prize</dt>
                <dd className="text-sb-gold font-semibold tabular-nums">
                  ${win.amount.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="player-history-label">Date</dt>
                <dd className="text-white">{formatWinDate(win.wonAt)}</dd>
              </div>
              <div>
                <dt className="player-history-label">Sport</dt>
                <dd className="text-white">{win.sport}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="player-history-label">Contest ID</dt>
                <dd className="text-sb-muted font-mono text-xs truncate" title={win.poolId}>
                  {win.poolId}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <p className="text-xs text-sb-muted">{payoutLabel(win.payoutStatus)}</p>
              <Link
                href={win.href}
                className="text-sm font-semibold text-sb-glow hover:text-white transition-colors min-h-[44px] inline-flex items-center"
              >
                View Details →
              </Link>
            </div>
          </LandingGlassCard>
        </div>
      ))}
    </div>
  );
}
