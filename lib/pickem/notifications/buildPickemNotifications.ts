import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getCurrentPickemContest } from "@/lib/pickem/db/contests";
import { getPlayerWeekResult } from "@/lib/pickem/db/playerWeekResults";
import {
  getTiebreakerEntryForPlayer,
  getTiebreakerForLeague,
} from "@/lib/pickem/db/tiebreakers";
import { NOTIFICATION_TEMPLATES } from "@/lib/platform/language";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";
import { PICKEM_CHAMPIONSHIP_TIEBREAKER_TITLE } from "@/lib/pickem/copy";

export async function buildPickemNotifications(
  email: string
): Promise<PlayerNotification[]> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();
  const notifications: PlayerNotification[] = [];
  const now = Date.now();

  const contest = await getCurrentPickemContest("nfl");
  if (!contest) return notifications;

  const { data: entry } = await supabase
    .from("pickem_entry_purchases")
    .select("*, contest_id")
    .eq("email", normalized)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(5);

  const paidEntries = entry ?? [];

  if (contest.status === "open" && paidEntries.length === 0) {
    notifications.push({
      id: `pickem-week-open-${contest.id}`,
      type: "pickem_week_open",
      title: `🏈 ${NOTIFICATION_TEMPLATES.pickemWeekOpen}`,
      detail: `${contest.label} — enter any tier and make your picks before kickoff.`,
      at: new Date().toISOString(),
    });
  }

  for (const row of paidEntries) {
    const leagueId = row.league_id as string | null;
    if (!leagueId) continue;

    const { data: league } = await supabase
      .from("pickem_leagues")
      .select("player_count, max_players, league_number, entry_tier_cents, status")
      .eq("id", leagueId)
      .maybeSingle();

    if (!league) continue;

    const playerCount = league.player_count as number;
    const maxPlayers = league.max_players as number;
    const remaining = maxPlayers - playerCount;
    const tier = (league.entry_tier_cents as number) / 100;

    if (remaining > 0 && remaining <= 100) {
      notifications.push({
        id: `pickem-pool-almost-${leagueId}`,
        type: "pickem_pool_almost_full",
        title: `🔥 ${NOTIFICATION_TEMPLATES.poolAlmostFull}`,
        detail: `${contest.label} · $${tier} · Pool #${league.league_number} · ${remaining} spots left`,
        at: new Date().toISOString(),
      });
    }

    if (remaining === 0 || league.status === "full") {
      notifications.push({
        id: `pickem-pool-full-${leagueId}`,
        type: "pickem_pool_full",
        title: `✅ ${NOTIFICATION_TEMPLATES.poolAtCapacity}`,
        detail: `${contest.label} · $${tier} · Pool #${league.league_number} · 1,000 players joined`,
        at: new Date().toISOString(),
      });
    }

    const weekResult = await getPlayerWeekResult({
      contestId: row.contest_id as string,
      leagueId,
      email: normalized,
    });

    if (weekResult?.status === "eliminated") {
      notifications.push({
        id: `pickem-eliminated-${leagueId}`,
        type: "pickem_sunday_complete",
        title: NOTIFICATION_TEMPLATES.pickemSundayComplete,
        detail: `${contest.label} · Record ${weekResult.sundayRecord} · You did not advance`,
        at: new Date().toISOString(),
      });
    }

    if (weekResult?.status === "tiebreaker") {
      notifications.push({
        id: `pickem-championship-${leagueId}`,
        type: "pickem_championship",
        title: PICKEM_CHAMPIONSHIP_TIEBREAKER_TITLE,
        detail: `${contest.label} · Submit your MNF total score prediction before kickoff`,
        at: new Date().toISOString(),
      });

      const tb = await getTiebreakerForLeague(leagueId);
      if (tb) {
        const myEntry = await getTiebreakerEntryForPlayer({
          tiebreakerId: tb.id,
          email: normalized,
        });

        if (!myEntry?.predictedTotal) {
          notifications.push({
            id: `pickem-prediction-due-${tb.id}`,
            type: "pickem_prediction_due",
            title: `⏱ ${NOTIFICATION_TEMPLATES.mondayPredictionDue}`,
            detail: "Enter combined MNF points to stay in the championship tiebreaker",
            at: new Date().toISOString(),
          });
        }

        if (tb.status === "locked" || tb.status === "complete" || tb.status === "split") {
          notifications.push({
            id: `pickem-prediction-locked-${tb.id}`,
            type: "pickem_prediction_locked",
            title: `🔒 ${NOTIFICATION_TEMPLATES.predictionLocked}`,
            detail: "MNF kickoff passed — standings finalize automatically",
            at: new Date().toISOString(),
          });
        }
      }
    }

    if (weekResult?.status === "winner" || weekResult?.status === "prize_split") {
      notifications.push({
        id: `pickem-winner-${leagueId}`,
        type: "pickem_winner",
        title:
          weekResult.status === "prize_split"
            ? `🤝 ${NOTIFICATION_TEMPLATES.pickemChampionSplit}`
            : `🏆 ${NOTIFICATION_TEMPLATES.pickemPoolChampion}`,
        detail: `${contest.label} · Pool #${league.league_number}`,
        at: new Date().toISOString(),
      });
    }
  }

  const { data: payouts } = await supabase
    .from("pickem_payouts")
    .select("*")
    .eq("email", normalized)
    .order("created_at", { ascending: false })
    .limit(5);

  for (const payout of payouts ?? []) {
    if (payout.status === "paid") {
      notifications.push({
        id: `pickem-payout-${payout.id}`,
        type: "pickem_payout",
        title: `💰 ${NOTIFICATION_TEMPLATES.pickemPayoutSent}`,
        detail: `$${((payout.amount_cents as number) / 100).toFixed(2)} via Stripe`,
        at: (payout.updated_at as string) ?? new Date().toISOString(),
      });
    }
  }

  const { data: stats } = await supabase
    .from("pickem_player_stats")
    .select("current_streak, longest_streak, season_wins")
    .eq("email", normalized)
    .eq("sport", "nfl")
    .eq("season_year", contest.seasonYear)
    .maybeSingle();

  if (stats && (stats.current_streak as number) >= 5) {
    notifications.push({
      id: `pickem-streak-${contest.seasonYear}`,
      type: "pickem_streak",
      title: `🔥 ${NOTIFICATION_TEMPLATES.pickemWinStreak}`,
      detail: `${stats.current_streak as number} picks in a row — keep it going`,
      at: new Date().toISOString(),
    });
  }

  const { data: perfectWeek } = await supabase
    .from("pickem_week_history")
    .select("week_label, weekly_record")
    .eq("email", normalized)
    .like("weekly_record", "%-%")
    .order("created_at", { ascending: false })
    .limit(20);

  for (const row of perfectWeek ?? []) {
    const record = row.weekly_record as string;
    const [wins, losses] = record.split("-").map(Number);
    if (losses === 0 && wins > 0) {
      notifications.push({
        id: `pickem-perfect-${row.week_label}`,
        type: "pickem_achievement",
        title: `⭐ ${NOTIFICATION_TEMPLATES.pickemPerfectWeek}`,
        detail: `${row.week_label as string} · ${record} — flawless picks`,
        at: new Date().toISOString(),
      });
      break;
    }
  }

  const { data: history } = await supabase
    .from("pickem_week_history")
    .select("finish_place, week_label")
    .eq("email", normalized)
    .eq("finish_place", 1)
    .order("created_at", { ascending: false })
    .limit(1);

  if (history?.[0]) {
    notifications.push({
      id: `pickem-rank-${history[0].week_label}`,
      type: "pickem_rank_up",
      title: `📈 ${NOTIFICATION_TEMPLATES.leaderboardPromotion}`,
      detail: `#1 finish — ${history[0].week_label as string}`,
      at: new Date().toISOString(),
    });
  }

  void now;
  return notifications.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}
