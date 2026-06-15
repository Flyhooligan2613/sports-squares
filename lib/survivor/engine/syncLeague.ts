import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import type { PickemScheduleGame } from "@/lib/pickem/types";
import {
  countEntriesByStatus,
  crownSurvivorChampion,
  markSurvivorWeekSurvived,
  processSurvivorLoss,
} from "@/lib/survivor/db/entries";
import { recordShieldUse } from "@/lib/survivor/db/shields";
import {
  listActiveSurvivorLeagues,
  updateSurvivorLeagueFields,
  type SurvivorLeague,
} from "@/lib/survivor/db/leagues";
import {
  listPicksForWeek,
  resolveSurvivorPick,
} from "@/lib/survivor/db/picks";
import {
  getCurrentSurvivorWeek,
  refreshSurvivorWeekCounts,
  updateSurvivorWeekStatus,
  type SurvivorWeek,
} from "@/lib/survivor/db/weeks";
import { seedSurvivorSeason } from "@/lib/survivor/engine/seedSeason";
import { espnMetaForSurvivorWeekNumber } from "@/lib/survivor/nflWeeks";
import { publishPlatformEvent } from "@/lib/events/engine";

function teamWon(game: PickemScheduleGame, teamAbbr: string): boolean | null {
  const abbr = teamAbbr.toUpperCase();
  if (game.status !== "final" || !game.completed) return null;
  if (game.winnerSide === "tie") return null;

  if (game.awayAbbr?.toUpperCase() === abbr) return game.winnerSide === "away";
  if (game.homeAbbr?.toUpperCase() === abbr) return game.winnerSide === "home";
  return null;
}

function deriveWeekStatus(
  games: PickemScheduleGame[],
  current: SurvivorWeek["status"],
  options?: { keepScheduledWithoutGames?: boolean }
): SurvivorWeek["status"] {
  if (games.length === 0) {
    if (options?.keepScheduledWithoutGames) return current;
    return current === "scheduled" ? "open" : current;
  }

  const now = Date.now();
  const anyStarted = games.some((g) => new Date(g.kickoffAt).getTime() <= now);
  const anyLive = games.some((g) => g.status === "live");
  const allFinal = games.every((g) => g.status === "final");

  if (allFinal) return "complete";
  if (anyLive || anyStarted) return "scoring";
  if (current === "scheduled") return "open";
  return current === "complete" ? "complete" : "locked";
}

async function resolveWeekPicks(
  league: SurvivorLeague,
  week: SurvivorWeek,
  games: PickemScheduleGame[]
): Promise<{ eliminated: number; survived: number; shieldsActivated: number }> {
  const supabase = (await import("@/lib/supabase/admin")).getSupabaseAdmin();
  const picks = await listPicksForWeek(week.id);
  let eliminated = 0;
  let survived = 0;
  let shieldsActivated = 0;

  for (const pick of picks) {
    if (pick.result !== "pending") continue;

    const game = games.find((g) => g.espnGameId === pick.espnGameId);
    if (!game) continue;

    const won = teamWon(game, pick.teamAbbr);
    if (won === null) continue;

    if (won) {
      await resolveSurvivorPick(pick.id, "survived");
      await markSurvivorWeekSurvived(pick.entryId);
      survived += 1;

      await publishPlatformEvent({
        type: "survivor.survived",
        priority: "high",
        summary: `${pick.teamName} survived Week ${week.weekNumber}`,
        gameType: "survivor",
        entityType: "survivor_entry",
        entityId: pick.entryId,
        actorEmail: pick.email,
        payload: {
          weekNumber: week.weekNumber,
          teamAbbr: pick.teamAbbr,
        },
        idempotencyKey: `${pick.id}:survived`,
      }).catch(() => undefined);
    } else {
      const outcome = await processSurvivorLoss({
        entryId: pick.entryId,
        weekNumber: week.weekNumber,
        allowShield: true,
      });

      if (outcome === "shield_consumed") {
        await resolveSurvivorPick(pick.id, "shield_saved");
        await markSurvivorWeekSurvived(pick.entryId);
        await recordShieldUse({
          entryId: pick.entryId,
          leagueId: week.leagueId,
          weekId: week.id,
          pickId: pick.id,
          email: pick.email,
          weekNumber: week.weekNumber,
          teamAbbr: pick.teamAbbr,
          teamName: pick.teamName,
        });
        survived += 1;
        shieldsActivated += 1;

        const { data: entryRow } = await supabase
          .from("survivor_entries")
          .select("display_name")
          .eq("id", pick.entryId)
          .maybeSingle();
        const displayName = (entryRow?.display_name as string) ?? pick.email;

        await publishPlatformEvent({
          type: "survivor.shield_activated",
          priority: "critical",
          summary: `🛡️ ${displayName}'s Survivor Shield activated!`,
          gameType: "survivor",
          entityType: "survivor_entry",
          entityId: pick.entryId,
          actorEmail: pick.email,
          payload: {
            weekNumber: week.weekNumber,
            teamAbbr: pick.teamAbbr,
            teamName: pick.teamName,
            pickId: pick.id,
            displayName,
          },
          idempotencyKey: `${pick.id}:shield`,
        }).catch(() => undefined);

        await publishPlatformEvent({
          type: "survivor.shield_depleted",
          priority: "normal",
          summary: `Survivor Shield consumed — no second chances remain`,
          gameType: "survivor",
          entityType: "survivor_entry",
          entityId: pick.entryId,
          actorEmail: pick.email,
          payload: { weekNumber: week.weekNumber },
          idempotencyKey: `${pick.entryId}:shield_depleted`,
        }).catch(() => undefined);
      } else if (outcome === "life_consumed") {
        await resolveSurvivorPick(pick.id, "eliminated");

        const { data: entryRow } = await supabase
          .from("survivor_entries")
          .select("display_name, lives_remaining")
          .eq("id", pick.entryId)
          .maybeSingle();
        const displayName = (entryRow?.display_name as string) ?? pick.email;
        const livesRemaining = (entryRow?.lives_remaining as number) ?? 0;

        await publishPlatformEvent({
          type: "survivor.life_lost",
          priority: "high",
          summary: `${displayName} lost a life on ${pick.teamName} — ${livesRemaining} remaining`,
          gameType: "survivor",
          entityType: "survivor_entry",
          entityId: pick.entryId,
          actorEmail: pick.email,
          payload: {
            weekNumber: week.weekNumber,
            teamAbbr: pick.teamAbbr,
            teamName: pick.teamName,
            pickId: pick.id,
            displayName,
            livesRemaining,
            entryId: pick.entryId,
          },
          idempotencyKey: `${pick.id}:life_lost`,
        }).catch(() => undefined);
      } else {
        await resolveSurvivorPick(pick.id, "eliminated");
        eliminated += 1;

        await publishPlatformEvent({
          type: "survivor.eliminated",
          priority: "high",
          summary: `Eliminated on ${pick.teamName} (Week ${week.weekNumber})`,
          gameType: "survivor",
          entityType: "survivor_entry",
          entityId: pick.entryId,
          actorEmail: pick.email,
          payload: {
            weekNumber: week.weekNumber,
            teamAbbr: pick.teamAbbr,
          },
          idempotencyKey: `${pick.id}:eliminated`,
        }).catch(() => undefined);
      }
    }
  }

  void league;

  const { data: activeEntries } = await supabase
    .from("survivor_entries")
    .select("id")
    .eq("league_id", week.leagueId)
    .eq("status", "active");

  const pickedEntryIds = new Set(picks.map((p) => p.entryId));
  for (const row of activeEntries ?? []) {
    const entryId = row.id as string;
    if (pickedEntryIds.has(entryId)) continue;
    await processSurvivorLoss({
      entryId,
      weekNumber: week.weekNumber,
      allowShield: false,
    });
    eliminated += 1;
  }

  return { eliminated, survived, shieldsActivated };
}

async function publishSurvivorChampionEvent(
  league: SurvivorLeague,
  champion: Awaited<ReturnType<typeof crownSurvivorChampion>>,
  idempotencySuffix: string
): Promise<void> {
  if (!champion) return;

  const isTurbo = league.mode === "turbo";
  await publishPlatformEvent({
    type: "survivor.champion_crowned",
    priority: "critical",
    summary: isTurbo
      ? `Survivor X™ Turbo ${league.seasonYear} champion crowned`
      : `Survivor X™ ${league.seasonYear} champion crowned`,
    gameType: "survivor",
    entityType: "survivor_league",
    entityId: league.id,
    actorEmail: champion.email,
    payload: {
      seasonYear: league.seasonYear,
      leagueId: league.id,
      leagueMode: league.mode,
      displayName: champion.displayName ?? champion.email,
      weeksSurvived: champion.weeksSurvived ?? 0,
      shieldWasUsed: champion.shieldUsedWeek != null,
    },
    idempotencyKey: `${league.id}:champion:${idempotencySuffix}`,
  }).catch(() => undefined);
}

async function crownRemainingSurvivors(league: SurvivorLeague): Promise<number> {
  const supabase = (await import("@/lib/supabase/admin")).getSupabaseAdmin();
  const { data: rows } = await supabase
    .from("survivor_entries")
    .select("id")
    .eq("league_id", league.id)
    .eq("status", "active");

  let crowned = 0;
  for (const row of rows ?? []) {
    const champion = await crownSurvivorChampion(row.id as string);
    await publishSurvivorChampionEvent(league, champion, row.id as string);
    crowned += 1;
  }

  if (crowned > 0) {
    await updateSurvivorLeagueFields(league.id, { status: "complete" });
  }

  return crowned;
}

export async function syncSurvivorLeague(league: SurvivorLeague): Promise<{
  weekNumber: number;
  weekStatus: string;
  eliminated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let eliminated = 0;

  const week = await getCurrentSurvivorWeek(league.id);
  if (!week) {
    return { weekNumber: 0, weekStatus: "none", eliminated: 0, errors: ["No weeks"] };
  }

  const espnMeta = espnMetaForSurvivorWeekNumber(week.weekNumber, { mode: league.mode });

  let games: PickemScheduleGame[] = [];
  try {
    const board = await fetchPickemScoreboard({
      sport: "nfl",
      week: espnMeta.espnWeekNumber,
      seasonType: espnMeta.seasonType,
      seasonYear: league.seasonYear,
    });
    games = board.games;
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "ESPN fetch failed");
  }

  const nextStatus = deriveWeekStatus(games, week.status, {
    keepScheduledWithoutGames: league.mode === "turbo" && week.status === "scheduled",
  });
  if (nextStatus !== week.status) {
    const extra: Record<string, string> = {};
    if (nextStatus === "locked") extra.locks_at = new Date().toISOString();
    if (nextStatus === "complete") extra.completes_at = new Date().toISOString();
    if (nextStatus === "open" && !week.opensAt) extra.opens_at = new Date().toISOString();
    await updateSurvivorWeekStatus(week.id, nextStatus, extra);
  }

  if (nextStatus === "complete" && week.status !== "complete") {
    const result = await resolveWeekPicks(league, week, games);
    eliminated = result.eliminated;

    const activeRemaining = await countEntriesByStatus(league.id, "active");
    await refreshSurvivorWeekCounts(week.id, {
      playersRemaining: activeRemaining,
      eliminatedCount: result.eliminated,
    });

    if (activeRemaining === 1) {
      const supabase = (await import("@/lib/supabase/admin")).getSupabaseAdmin();
      const { data: championRow } = await supabase
        .from("survivor_entries")
        .select("*")
        .eq("league_id", league.id)
        .eq("status", "active")
        .maybeSingle();

      if (championRow?.id) {
        const champion = await crownSurvivorChampion(championRow.id as string);
        await updateSurvivorLeagueFields(league.id, { status: "complete" });
        await publishSurvivorChampionEvent(league, champion, championRow.id as string);
      }
    } else {
      const nextWeekNumber = week.weekNumber + 1;
      const { getSurvivorWeek, updateSurvivorWeekStatus: openNext } = await import(
        "@/lib/survivor/db/weeks"
      );
      const next = await getSurvivorWeek(league.id, nextWeekNumber);

      if (!next) {
        if (activeRemaining > 0) {
          await crownRemainingSurvivors(league);
        } else {
          await updateSurvivorLeagueFields(league.id, { status: "complete" });
        }
      } else {
        await updateSurvivorLeagueFields(league.id, {
          status: "active",
          current_week: nextWeekNumber,
        });

        if (next.status === "scheduled") {
          await openNext(next.id, "open", { opens_at: new Date().toISOString() });
        }

        await publishPlatformEvent({
          type: "survivor.week_complete",
          priority: "normal",
          summary: `Survivor Week ${week.weekNumber} complete — ${activeRemaining} remain`,
          gameType: "survivor",
          entityType: "survivor_week",
          entityId: week.id,
          payload: {
            weekNumber: week.weekNumber,
            playersRemaining: activeRemaining,
            eliminated: result.eliminated,
            shieldsActivated: result.shieldsActivated,
            leagueMode: league.mode,
          },
          idempotencyKey: `${week.id}:complete`,
        }).catch(() => undefined);
      }
    }
  } else {
    const activeRemaining = await countEntriesByStatus(league.id, "active");
    await refreshSurvivorWeekCounts(week.id, {
      playersRemaining: activeRemaining,
      eliminatedCount: week.eliminatedCount,
    });
  }

  return {
    weekNumber: week.weekNumber,
    weekStatus: nextStatus,
    eliminated,
    errors,
  };
}

export async function syncAllSurvivorLeagues(): Promise<{
  synced: number;
  results: Awaited<ReturnType<typeof syncSurvivorLeague>>[];
}> {
  await seedSurvivorSeason();
  const leagues = await listActiveSurvivorLeagues();
  const results: Awaited<ReturnType<typeof syncSurvivorLeague>>[] = [];

  for (const league of leagues) {
    results.push(await syncSurvivorLeague(league));
  }

  return { synced: leagues.length, results };
}
