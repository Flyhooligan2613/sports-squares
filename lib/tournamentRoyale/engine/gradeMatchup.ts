import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { cinderellaPointsForUpset } from "@/lib/tournamentRoyale/cinderella";
import { applyCinderellaMeter } from "@/lib/tournamentRoyale/cinderella";
import { bracketPointsForRound, resolveComboMultiplier } from "@/lib/tournamentRoyale/combos";
import { getMatchupById } from "@/lib/tournamentRoyale/db/matchups";
import { listRoundsForEvent } from "@/lib/tournamentRoyale/db/rounds";
import { TOURNAMENT_EVENT_TYPES } from "@/lib/tournamentRoyale/events";
import { publishPlatformEvent } from "@/lib/events/engine";

/** Grade all picks for a finalized matchup and update entry stats. */
export async function gradeMatchup(matchupId: string): Promise<number> {
  const matchup = await getMatchupById(matchupId);
  if (!matchup?.winner_team_name || matchup.status !== "final") return 0;

  const supabase = getSupabaseAdmin();
  const rounds = await listRoundsForEvent(matchup.event_id);
  const round = rounds.find((r) => r.id === matchup.round_id);
  const roundNumber = round?.round_number ?? 3;
  const basePoints = bracketPointsForRound(roundNumber);

  const { data: picks, error } = await supabase
    .from("tournament_royale_picks")
    .select("*, tournament_royale_entries!inner(*)")
    .eq("matchup_id", matchupId);

  if (error) throw error;
  if (!picks?.length) return 0;

  let graded = 0;

  for (const pick of picks) {
    const entry = pick.tournament_royale_entries as {
      id: string;
      combo_streak: number;
      best_combo_streak: number;
      cinderella_meter: number;
      total_points: number;
      shield_available: boolean;
      shield_used_matchup_id: string | null;
    };

    const isCorrect = pick.picked_team_name === matchup.winner_team_name;
    const winnerSeed =
      pick.picked_team_name === matchup.top_team_name
        ? matchup.top_team_seed
        : matchup.bottom_team_seed;
    const loserSeed =
      pick.picked_team_name === matchup.top_team_name
        ? matchup.bottom_team_seed
        : matchup.top_team_seed;
    const isUpset =
      isCorrect &&
      winnerSeed > loserSeed &&
      winnerSeed >= 10;

    let pointsEarned = 0;
    let cinderellaPoints = 0;
    let shieldApplied = false;
    let newStreak = isCorrect ? entry.combo_streak + 1 : 0;

    if (isCorrect) {
      const combo = resolveComboMultiplier(newStreak);
      pointsEarned = Math.round(basePoints * combo.multiplier);
      if (isUpset) {
        cinderellaPoints = cinderellaPointsForUpset(winnerSeed, loserSeed);
      }
    } else if (
      entry.shield_available &&
      roundNumber === 4 &&
      !entry.shield_used_matchup_id
    ) {
      shieldApplied = true;
      newStreak = entry.combo_streak;
      pointsEarned = Math.round(basePoints * 0.5);
      await supabase.from("tournament_royale_shield_uses").insert({
        entry_id: entry.id,
        matchup_id: matchupId,
        round_label: round?.label ?? "Elite Eight",
      });
      await supabase
        .from("tournament_royale_entries")
        .update({
          shield_available: false,
          shield_used_matchup_id: matchupId,
        })
        .eq("id", entry.id);

      await publishPlatformEvent({
        type: TOURNAMENT_EVENT_TYPES.SHIELD_ACTIVATED,
        priority: "high",
        summary: "Bracket Shield™ activated",
        gameType: "brackets",
        entityType: "tournament_pick",
        entityId: pick.id,
        payload: { matchupId },
        idempotencyKey: `${pick.id}:shield`,
      }).catch(() => undefined);
    } else {
      newStreak = 0;
    }

    const combo = resolveComboMultiplier(newStreak);
    const newCinderella = applyCinderellaMeter(
      entry.cinderella_meter,
      cinderellaPoints
    );
    const newTotal = entry.total_points + pointsEarned;
    const bestCombo = Math.max(entry.best_combo_streak, newStreak);

    await supabase
      .from("tournament_royale_picks")
      .update({
        is_correct: isCorrect,
        is_upset: isUpset,
        points_earned: pointsEarned,
        cinderella_points: cinderellaPoints,
        shield_applied: shieldApplied,
        graded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", pick.id);

    await supabase
      .from("tournament_royale_entries")
      .update({
        total_points: newTotal,
        combo_streak: newStreak,
        best_combo_streak: bestCombo,
        combo_multiplier: combo.multiplier,
        cinderella_meter: newCinderella,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entry.id);

    if (isUpset && cinderellaPoints > 0) {
      await publishPlatformEvent({
        type: TOURNAMENT_EVENT_TYPES.UPSET_BONUS,
        priority: "normal",
        summary: `Cinderella Meter™ +${cinderellaPoints}`,
        gameType: "brackets",
        entityType: "tournament_pick",
        entityId: pick.id,
        payload: { cinderellaPoints },
        idempotencyKey: `${pick.id}:upset`,
      }).catch(() => undefined);
    }

    graded += 1;
  }

  return graded;
}
