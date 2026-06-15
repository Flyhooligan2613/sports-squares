import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getTournamentDefinition,
  ROUND_LABELS_NCAAB,
} from "@/lib/tournamentRoyale/config";
import type { TournamentKey } from "@/lib/tournamentRoyale/types";

/** Demo Sweet 16 bracket — 4 matchups, 3 rounds for Phase 1. */
const DEMO_SWEET_16 = [
  { region: "South", top: { name: "Houston", seed: 1 }, bottom: { name: "Gonzaga", seed: 8 } },
  { region: "East", top: { name: "Purdue", seed: 2 }, bottom: { name: "Nevada", seed: 10 } },
  { region: "West", top: { name: "Kentucky", seed: 3 }, bottom: { name: "NC State", seed: 11 } },
  { region: "Midwest", top: { name: "Auburn", seed: 4 }, bottom: { name: "Michigan", seed: 5 } },
] as const;

export interface TournamentSeedResult {
  eventId: string;
  poolId: string;
  seasonYear: number;
  roundsCreated: number;
  matchupsCreated: number;
}

export async function seedDemoTournament(
  tournamentKey: TournamentKey = "ncaab_mens",
  seasonYear = new Date().getFullYear()
): Promise<TournamentSeedResult> {
  const def = getTournamentDefinition(tournamentKey);
  const supabase = getSupabaseAdmin();

  const { data: existingEvent } = await supabase
    .from("tournament_royale_events")
    .select("id")
    .eq("tournament_key", tournamentKey)
    .eq("season_year", seasonYear)
    .maybeSingle();

  if (existingEvent) {
    const pool = await supabase
      .from("tournament_royale_pools")
      .select("id")
      .eq("event_id", existingEvent.id)
      .eq("visibility", "global")
      .maybeSingle();

    return {
      eventId: existingEvent.id,
      poolId: pool.data?.id ?? "",
      seasonYear,
      roundsCreated: 0,
      matchupsCreated: 0,
    };
  }

  const locksAt = new Date();
  locksAt.setDate(locksAt.getDate() + 7);

  const { data: event, error: eventError } = await supabase
    .from("tournament_royale_events")
    .insert({
      tournament_key: tournamentKey,
      sport: def.sport,
      season_year: seasonYear,
      name: `${def.name} ${seasonYear}`,
      description: def.description,
      status: "open",
      current_round_number: 3,
      locks_at: locksAt.toISOString(),
      starts_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (eventError) throw eventError;

  const { data: pool, error: poolError } = await supabase
    .from("tournament_royale_pools")
    .insert({
      event_id: event.id,
      name: "Global Bracket",
      visibility: "global",
    })
    .select("id")
    .single();

  if (poolError) throw poolError;

  const roundLabels = [
    { roundNumber: 3, label: ROUND_LABELS_NCAAB[2] },
    { roundNumber: 4, label: ROUND_LABELS_NCAAB[3] },
    { roundNumber: 5, label: ROUND_LABELS_NCAAB[4] },
  ];

  const roundIds: string[] = [];
  let roundsCreated = 0;

  for (const spec of roundLabels) {
    const { data: round, error } = await supabase
      .from("tournament_royale_rounds")
      .insert({
        event_id: event.id,
        round_number: spec.roundNumber,
        label: spec.label,
        status: spec.roundNumber === 3 ? "open" : "scheduled",
      })
      .select("id")
      .single();

    if (error) throw error;
    roundIds.push(round.id);
    roundsCreated += 1;
  }

  let matchupsCreated = 0;
  const sweet16RoundId = roundIds[0];
  const elite8RoundId = roundIds[1];
  const finalFourRoundId = roundIds[2];

  const sweet16MatchupIds: string[] = [];

  for (let i = 0; i < DEMO_SWEET_16.length; i += 1) {
    const m = DEMO_SWEET_16[i];
    const { data: matchup, error } = await supabase
      .from("tournament_royale_matchups")
      .insert({
        event_id: event.id,
        round_id: sweet16RoundId,
        slot_index: i,
        region: m.region,
        top_team_name: m.top.name,
        top_team_seed: m.top.seed,
        bottom_team_name: m.bottom.name,
        bottom_team_seed: m.bottom.seed,
        status: "scheduled",
      })
      .select("id")
      .single();

    if (error) throw error;
    sweet16MatchupIds.push(matchup.id);
    matchupsCreated += 1;
  }

  const elite8MatchupIds: string[] = [];
  for (let i = 0; i < 2; i += 1) {
    const { data: matchup, error } = await supabase
      .from("tournament_royale_matchups")
      .insert({
        event_id: event.id,
        round_id: elite8RoundId,
        slot_index: i,
        region: i === 0 ? "South/East" : "West/Midwest",
        top_team_name: "TBD",
        top_team_seed: 1,
        bottom_team_name: "TBD",
        bottom_team_seed: 1,
        status: "scheduled",
      })
      .select("id")
      .single();

    if (error) throw error;
    elite8MatchupIds.push(matchup.id);
    matchupsCreated += 1;
  }

  await supabase.from("tournament_royale_matchups").insert({
    event_id: event.id,
    round_id: finalFourRoundId,
    slot_index: 0,
    region: null,
    top_team_name: "TBD",
    top_team_seed: 1,
    bottom_team_name: "TBD",
    bottom_team_seed: 1,
    status: "scheduled",
  });
  matchupsCreated += 1;

  for (let i = 0; i < sweet16MatchupIds.length; i += 1) {
    const advancesTo = elite8MatchupIds[Math.floor(i / 2)];
    await supabase
      .from("tournament_royale_matchups")
      .update({ advances_to_matchup_id: advancesTo })
      .eq("id", sweet16MatchupIds[i]);
  }

  for (const eliteId of elite8MatchupIds) {
    const { data: finalMatchup } = await supabase
      .from("tournament_royale_matchups")
      .select("id")
      .eq("round_id", finalFourRoundId)
      .maybeSingle();

    if (finalMatchup) {
      await supabase
        .from("tournament_royale_matchups")
        .update({ advances_to_matchup_id: finalMatchup.id })
        .eq("id", eliteId);
    }
  }

  return {
    eventId: event.id,
    poolId: pool.id,
    seasonYear,
    roundsCreated,
    matchupsCreated,
  };
}

export async function ensureDemoTournament(
  tournamentKey: TournamentKey = "ncaab_mens"
): Promise<{ eventId: string; poolId: string; seasonYear: number }> {
  const seed = await seedDemoTournament(tournamentKey);
  return {
    eventId: seed.eventId,
    poolId: seed.poolId,
    seasonYear: seed.seasonYear,
  };
}
