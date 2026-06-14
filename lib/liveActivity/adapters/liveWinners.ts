import { buildLiveActivityEvent } from "@/lib/liveActivity/buildEvent";
import type { LiveActivityEvent } from "@/lib/liveActivity/types";
import type { LiveWinnersCenterData } from "@/lib/liveWinners/types";

function formatMaskedName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "A player";
  if (trimmed.includes("@")) return trimmed.split("@")[0] ?? trimmed;
  return trimmed;
}

export function mapLiveWinnersToActivity(data: LiveWinnersCenterData): LiveActivityEvent[] {
  const events: LiveActivityEvent[] = [];

  for (const winner of data.winners.slice(0, 8)) {
    events.push(
      buildLiveActivityEvent(
        {
          type: winner.amount >= 1000 ? "large_payout" : "quarter_winner",
          username: formatMaskedName(winner.maskedWinner),
          amount: winner.amount,
          amountCents: Math.round(winner.amount * 100),
          game: `${winner.awayTeam} vs ${winner.homeTeam}`,
        },
        `lw-winner-${winner.id}`
      )
    );
  }

  for (const item of data.activity.slice(0, 6)) {
    events.push(
      buildLiveActivityEvent(
        {
          type: item.type === "board_filled" ? "board_filled" : "game_live",
          message: `${item.title} — ${item.detail}`,
          emoji: item.type === "board_filled" ? "🏈" : "🟢",
        },
        `lw-activity-${item.id}`
      )
    );
  }

  if (data.stats.prizeMoneyToday > 0) {
    events.push(
      buildLiveActivityEvent(
        {
          type: "paid_today",
          amount: data.stats.prizeMoneyToday,
          amountCents: Math.round(data.stats.prizeMoneyToday * 100),
        },
        `lw-paid-today-${data.updatedAt}`
      )
    );
  }

  if (data.platform.playersOnline > 0) {
    events.push(
      buildLiveActivityEvent(
        {
          type: "players_online",
          amount: data.platform.playersOnline.toLocaleString("en-US"),
        },
        `lw-online-${data.updatedAt}`
      )
    );
  }

  if (data.stats.todaysPayouts > 0) {
    events.push(
      buildLiveActivityEvent(
        {
          type: "payouts_processed",
          amount: String(data.stats.todaysPayouts),
        },
        `lw-payouts-${data.updatedAt}`
      )
    );
  }

  if (data.platform.activeBoards > 0) {
    events.push(
      buildLiveActivityEvent(
        {
          type: "open_boards",
          amount: String(data.platform.activeBoards),
        },
        `lw-boards-${data.updatedAt}`
      )
    );
  }

  if (data.bigWin) {
    events.push(
      buildLiveActivityEvent(
        {
          type: "jackpot",
          username: formatMaskedName(data.bigWin.maskedWinner),
          amount: data.bigWin.amount,
          amountCents: Math.round(data.bigWin.amount * 100),
          game: `${data.bigWin.awayTeam} vs ${data.bigWin.homeTeam}`,
          isCelebration: data.bigWin.amount >= 1000,
        },
        `lw-bigwin-${data.bigWin.id}`
      )
    );
  }

  return events;
}
