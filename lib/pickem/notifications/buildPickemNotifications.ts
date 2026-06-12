import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getCurrentPickemContest } from "@/lib/pickem/db/contests";
import { getPlayerWeekResult } from "@/lib/pickem/db/playerWeekResults";
import {
  getTiebreakerEntryForPlayer,
  getTiebreakerForLeague,
} from "@/lib/pickem/db/tiebreakers";
import { PICKEM_CHAMPIONSHIP_TIEBREAKER_TITLE } from "@/lib/pickem/copy";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";

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
      title: "🏈 Pick'em week is open",
      detail: `${contest.label} — enter any tier and make your picks before kickoff.`,
      at: new Date().toISOString(),
    });
  }

  for (const row of paidEntries) {
    const leagueId = row.league_id as string | null;
    if (!leagueId) continue;

    const { data: league } = await supabase
      .from("pickem_leagues")
      .select("player_count, max_players, league_number, entry_tier_cents")
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
        title: "🔥 Pool almost full",
        detail: `${contest.label} · $${tier} · Pool #${league.league_number} · ${remaining} spots left`,
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
        title: "Sunday slate complete",
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
            title: "⏱ Monday prediction due",
            detail: "Enter combined MNF points to stay in the championship tiebreaker",
            at: new Date().toISOString(),
          });
        }

        if (tb.status === "locked" || tb.status === "complete" || tb.status === "split") {
          notifications.push({
            id: `pickem-prediction-locked-${tb.id}`,
            type: "pickem_prediction_locked",
            title: "🔒 Prediction locked",
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
            ? "🤝 Championship tie — prize split"
            : "🏆 Pick'em pool winner",
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
        title: "💰 Pick'em payout sent",
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
      title: "🔥 Win streak active",
      detail: `${stats.current_streak as number} picks in a row — keep it going`,
      at: new Date().toISOString(),
    });
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
      title: "📈 Leaderboard promotion",
      detail: `#1 finish — ${history[0].week_label as string}`,
      at: new Date().toISOString(),
    });
  }

  void now;
  return notifications.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}
