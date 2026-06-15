import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getTournamentEntry, listTopEntries } from "@/lib/tournamentRoyale/db/entries";
import { getActiveTournamentEvent } from "@/lib/tournamentRoyale/db/events";
import { listMatchupsForEvent } from "@/lib/tournamentRoyale/db/matchups";
import { getGlobalPoolForEvent } from "@/lib/tournamentRoyale/db/pools";
import { listPicksForEntry } from "@/lib/tournamentRoyale/db/picks";
import { getCurrentRound, listRoundsForEvent } from "@/lib/tournamentRoyale/db/rounds";
import type { TournamentHubView, TournamentKey } from "@/lib/tournamentRoyale/types";

function mapEventSummary(
  event: NonNullable<Awaited<ReturnType<typeof getActiveTournamentEvent>>>,
  currentRoundLabel: string
): TournamentHubView["event"] {
  return {
    id: event.id,
    name: event.name,
    tournamentKey: event.tournament_key as TournamentKey,
    sport: event.sport as TournamentHubView["event"]["sport"],
    seasonYear: event.season_year,
    status: event.status,
    currentRoundLabel,
    currentRoundNumber: event.current_round_number,
    locksAt: event.locks_at,
  };
}

function computeAccuracy(
  picks: Awaited<ReturnType<typeof listPicksForEntry>>,
  matchups: Awaited<ReturnType<typeof listMatchupsForEvent>>
): number {
  const finalMatchups = matchups.filter((m) => m.status === "final");
  if (!finalMatchups.length) return 0;

  const pickMap = new Map(picks.map((p) => [p.matchup_id, p]));
  let correct = 0;
  let graded = 0;

  for (const m of finalMatchups) {
    const pick = pickMap.get(m.id);
    if (!pick || pick.is_correct == null) continue;
    graded += 1;
    if (pick.is_correct) correct += 1;
  }

  return graded > 0 ? Math.round((correct / graded) * 100) : 0;
}

export async function buildTournamentHubView(input: {
  tournamentKey: TournamentKey;
  email?: string | null;
}): Promise<TournamentHubView | null> {
  const event = await getActiveTournamentEvent(input.tournamentKey);
  if (!event) return null;

  const pool = await getGlobalPoolForEvent(event.id);
  if (!pool) return null;

  const rounds = await listRoundsForEvent(event.id);
  const currentRound =
    (await getCurrentRound(event.id, event.current_round_number)) ??
    rounds.find((r) => r.round_number === event.current_round_number) ??
    null;

  const matchups = await listMatchupsForEvent(event.id);
  const gamesRemaining = matchups.filter((m) => m.status !== "final").length;

  let entry = null;
  let picks: Awaited<ReturnType<typeof listPicksForEntry>> = [];
  let communityRank: number | null = null;

  if (input.email) {
    const row = await getTournamentEntry(pool.id, input.email);
    if (row) {
      picks = await listPicksForEntry(row.id);
      const accuracy = computeAccuracy(picks, matchups);
      entry = {
        id: row.id,
        totalPoints: row.total_points,
        accuracyPct: accuracy,
        bracketCompletionPct: Number(row.bracket_completion_pct),
        rankPosition: row.rank_position,
        cinderellaMeter: row.cinderella_meter,
        comboStreak: row.combo_streak,
        comboMultiplier: Number(row.combo_multiplier),
        bestComboStreak: row.best_combo_streak,
        shieldAvailable: row.shield_available,
        tournamentXp: row.total_points * 2,
      };

      const supabase = getSupabaseAdmin();
      const { count } = await supabase
        .from("tournament_royale_entries")
        .select("*", { count: "exact", head: true })
        .eq("pool_id", pool.id)
        .gt("total_points", row.total_points);

      communityRank = (count ?? 0) + 1;
    }
  }

  const topPlayers = await listTopEntries(pool.id, 5);
  const finalMatchups = matchups.filter((m) => m.status === "final");
  let communityCorrect = 0;
  let communityGraded = 0;

  if (finalMatchups.length) {
    const supabase = getSupabaseAdmin();
    const { data: allPicks } = await supabase
      .from("tournament_royale_picks")
      .select("is_correct")
      .in(
        "matchup_id",
        finalMatchups.map((m) => m.id)
      )
      .not("is_correct", "is", null);

    for (const p of allPicks ?? []) {
      communityGraded += 1;
      if (p.is_correct) communityCorrect += 1;
    }
  }

  const upsetPicks = picks.filter((p) => p.is_upset && p.is_correct);
  const missPicks = picks.filter((p) => p.is_correct === false && !p.shield_applied);

  const championMatchup = matchups.find(
    (m) => m.slot_index === 0 && rounds.some((r) => r.id === m.round_id && r.label.includes("Final"))
  );

  return {
    event: mapEventSummary(event, currentRound?.label ?? "Sweet 16"),
    entry,
    stats: {
      gamesRemaining,
      friendsRemaining: 0,
      communityRank,
      bestUpset: upsetPicks.length
        ? `${upsetPicks[0].picked_team_name} upset`
        : null,
      biggestMiss: missPicks.length ? missPicks[0].picked_team_name : null,
      rewardProgressPct: entry
        ? Math.min(100, Math.round(entry.bracketCompletionPct * 0.6 + entry.accuracyPct * 0.4))
        : 0,
    },
    liveMap: {
      remainingPerfectBrackets: Math.max(
        0,
        pool.entry_count - Math.floor(pool.entry_count * 0.15)
      ),
      communityAccuracyPct:
        communityGraded > 0
          ? Math.round((communityCorrect / communityGraded) * 100)
          : 0,
      topPlayers: topPlayers.map((e) => ({
        name: e.display_name,
        points: e.total_points,
      })),
      mostPickedChampion: championMatchup?.top_team_name ?? null,
      biggestUpset:
        finalMatchups.find(
          (m) =>
            m.winner_team_name &&
            ((m.winner_team_name === m.bottom_team_name && m.bottom_team_seed >= 10) ||
              (m.winner_team_name === m.top_team_name && m.top_team_seed >= 10))
        )?.winner_team_name ?? null,
      trendingGames: matchups
        .filter((m) => m.status === "live" || m.status === "scheduled")
        .slice(0, 3)
        .map((m) => `${m.top_team_name} vs ${m.bottom_team_name}`),
      playersActive: pool.entry_count,
    },
    currentRoundId: currentRound?.id ?? null,
    joined: !!entry,
  };
}
