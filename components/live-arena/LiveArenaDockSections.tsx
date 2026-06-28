"use client";

import type { ContestCenterStats } from "@/lib/live-arena/types";

interface LiveWalletPanelProps {
  balance: number;
  paidToday?: number;
}

export function LiveWalletPanel({ balance, paidToday }: LiveWalletPanelProps) {
  return (
    <section
      id="la-section-wallet"
      className="la-glass-card p-4 space-y-3 scroll-mt-24"
      aria-labelledby="la-wallet-heading"
    >
      <h2
        id="la-wallet-heading"
        className="text-xs font-bold uppercase tracking-wider text-sb-muted"
      >
        💰 Contest Wallet
      </h2>
      <p className="text-3xl font-bold text-sb-gold tabular-nums">
        ${balance.toLocaleString()}
      </p>
      <p className="text-xs text-sb-muted leading-relaxed">
        Demo balance for contest entries and winnings. Payouts route here after
        verified wins.
      </p>
      {paidToday != null ? (
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-sm">
          <span className="text-sb-muted">Paid out today</span>
          <span className="font-semibold text-emerald-400 tabular-nums">
            ${paidToday.toLocaleString()}
          </span>
        </div>
      ) : null}
    </section>
  );
}

const MOCK_REWARDS = [
  { id: "streak", title: "Win Streak Bonus", detail: "3 correct quarters in a row", status: "2/3" },
  { id: "legacy", title: "Legacy Points", detail: "+120 from live arena activity", status: "Earned" },
  { id: "drop", title: "Monday Square Drop", detail: "Qualified — opens next Monday", status: "Locked" },
];

export function LiveRewardsPanel() {
  return (
    <section
      id="la-section-rewards"
      className="la-glass-card p-4 space-y-3 scroll-mt-24"
      aria-labelledby="la-rewards-heading"
    >
      <h2
        id="la-rewards-heading"
        className="text-xs font-bold uppercase tracking-wider text-sb-muted"
      >
        🎁 Rewards & Perks
      </h2>
      <ul className="space-y-2">
        {MOCK_REWARDS.map((reward) => (
          <li
            key={reward.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-semibold text-white">{reward.title}</p>
              <p className="text-[11px] text-sb-muted">{reward.detail}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300/90 shrink-0">
              {reward.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LiveWinningSummaryPanel({
  stats,
  userIsWinning,
  payout,
}: {
  stats: ContestCenterStats;
  userIsWinning?: boolean;
  payout?: number;
}) {
  return (
    <section
      id="la-section-winning"
      className="la-glass-card p-4 space-y-2 scroll-mt-24"
      aria-labelledby="la-winning-heading"
    >
      <h2
        id="la-winning-heading"
        className="text-xs font-bold uppercase tracking-wider text-sb-muted"
      >
        🏆 Winning Status
      </h2>
      {userIsWinning != null ? (
        <p
          className={[
            "text-sm font-bold text-center py-2 rounded-lg",
            userIsWinning
              ? "text-amber-300 bg-amber-500/10 border border-amber-400/25"
              : "text-white/50 bg-white/[0.03] border border-white/[0.06]",
          ].join(" ")}
        >
          {userIsWinning
            ? `You are currently winning${payout != null ? ` · $${payout.toLocaleString()}` : ""}`
            : "You are not currently winning"}
        </p>
      ) : (
        <p className="text-sm text-sb-muted">
          {stats.winningBoards} board{stats.winningBoards === 1 ? "" : "s"} in
          winning position · ${stats.potentialWinnings.toLocaleString()} potential
        </p>
      )}
    </section>
  );
}

export function LiveProfilePanel({ contestHistoryCount }: { contestHistoryCount: number }) {
  return (
    <section
      id="la-section-profile"
      className="la-glass-card p-4 space-y-3 scroll-mt-24"
      aria-labelledby="la-profile-heading"
    >
      <h2
        id="la-profile-heading"
        className="text-xs font-bold uppercase tracking-wider text-sb-muted"
      >
        👤 My Squares & Profile
      </h2>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted">Owned Squares</p>
          <p className="text-xl font-bold text-white">4</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted">Competition History</p>
          <p className="text-xl font-bold text-white">{contestHistoryCount}</p>
        </div>
      </div>
      <p className="text-[11px] text-sb-muted text-center">
        Tap your gold squares on the board for square details.
      </p>
    </section>
  );
}
