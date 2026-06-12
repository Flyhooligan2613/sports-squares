import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { PlayerRecentWin } from "@/lib/player/dashboardTypes";

interface RecentWinsTimelineProps {
  wins: PlayerRecentWin[];
}

function payoutLabel(status: PlayerRecentWin["payoutStatus"]): string {
  if (status === "paid") return "Deposit Complete · Stripe Transfer Successful";
  if (status === "pending") return "Payout processing";
  return "Payout pending setup";
}

export default function RecentWinsTimeline({ wins }: RecentWinsTimelineProps) {
  if (wins.length === 0) {
    return (
      <LandingGlassCard className="p-6 sm:p-8 text-center">
        <p className="text-4xl mb-3">🏆</p>
        <p className="text-white font-semibold mb-1">No wins yet</p>
        <p className="text-sb-muted text-sm">
          Your first quarter win will show up here — loud and clear.
        </p>
      </LandingGlassCard>
    );
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
          <LandingGlassCard className="player-timeline-card p-4 sm:p-5 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base sm:text-lg font-bold text-white">
                  {win.awayTeam} vs {win.homeTeam}
                </p>
                <p className="text-sb-muted text-sm mt-0.5">
                  Won {win.periodLabel}
                </p>
                <p className="text-xs text-sb-muted/80 mt-2">
                  {payoutLabel(win.payoutStatus)}
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-sb-success tabular-nums">
                +${win.amount.toLocaleString()}
              </p>
            </div>
          </LandingGlassCard>
        </div>
      ))}
    </div>
  );
}
