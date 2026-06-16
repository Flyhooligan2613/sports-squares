import LandingGlassCard from "@/components/landing/LandingGlassCard";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import GenesisEmptyState from "@/components/genesis/GenesisEmptyState";
import type { PlayerRecentWin } from "@/lib/player/dashboardTypes";
import { CONTEST_CTAS } from "@/lib/platform/language";

interface RecentWinsTimelineProps {
  wins: PlayerRecentWin[];
}

function payoutLabel(status: PlayerRecentWin["payoutStatus"]): string {
  if (status === "paid") return "✓ Paid Automatically";
  if (status === "pending") return "Payout processing";
  return "Payout pending setup";
}

export default function RecentWinsTimeline({ wins }: RecentWinsTimelineProps) {
  if (wins.length === 0) {
    return (
      <GenesisEmptyState
        emoji="🏆"
        title="Your first win is waiting"
        description="The next winner could be you. Browse today's live boards and start building your legacy timeline."
        actionLabel={CONTEST_CTAS.browseContests}
        actionHref="/games/nfl"
        context="my_games"
        compact
      />
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
