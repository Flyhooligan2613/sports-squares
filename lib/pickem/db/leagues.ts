import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import {
  PICKEM_DEFAULT_PRIZE_POOL_CENTS,
  PICKEM_LEAGUE_MAX_PLAYERS,
} from "@/lib/pickem/config";
import {
  PLATFORM_ENTRY_TIERS,
  normalizeEntryTierCents,
  isValidEntryTierCents,
} from "@/lib/platform/core/entryTiers";
import type { PickemContest } from "@/lib/pickem/types";

const TABLE = "pickem_leagues";

export interface PickemLeague {
  id: string;
  contestId: string;
  leagueNumber: number;
  maxPlayers: number;
  playerCount: number;
  prizePoolCents: number;
  entryTierCents: number;
  status: "open" | "full" | "complete";
  resolutionStatus: "open" | "sunday_complete" | "tiebreaker_active" | "complete" | "payout_pending";
}

interface LeagueRow {
  id: string;
  contest_id: string;
  league_number: number;
  max_players: number;
  player_count: number;
  prize_pool_cents: number;
  entry_tier_cents: number;
  status: PickemLeague["status"];
  resolution_status: PickemLeague["resolutionStatus"];
}

function mapLeague(row: LeagueRow): PickemLeague {
  return {
    id: row.id,
    contestId: row.contest_id,
    leagueNumber: row.league_number,
    maxPlayers: row.max_players,
    playerCount: row.player_count,
    prizePoolCents: row.prize_pool_cents,
    entryTierCents: normalizeEntryTierCents(row.entry_tier_cents),
    status: row.status,
    resolutionStatus: row.resolution_status ?? "open",
  };
}

function prizePoolForTier(entryTierCents: number): number {
  return Math.max(
    PICKEM_DEFAULT_PRIZE_POOL_CENTS,
    Math.round(entryTierCents * PICKEM_LEAGUE_MAX_PLAYERS * 0.1)
  );
}

export async function getPickemLeagueById(
  leagueId: string
): Promise<PickemLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", leagueId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapLeague(data as LeagueRow) : null;
}

export async function listPickemLeaguesForContest(
  contestId: string,
  entryTierCents?: number
): Promise<PickemLeague[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("contest_id", contestId)
    .order("league_number", { ascending: true });

  if (error) throw error;
  let rows = (data as LeagueRow[]).map(mapLeague);
  if (entryTierCents != null) {
    rows = rows.filter((l) => l.entryTierCents === entryTierCents);
  }
  return rows;
}

async function createPickemLeague(
  contestId: string,
  leagueNumber: number,
  entryTierCents: number
): Promise<PickemLeague> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      contest_id: contestId,
      league_number: leagueNumber,
      max_players: PICKEM_LEAGUE_MAX_PLAYERS,
      prize_pool_cents: prizePoolForTier(entryTierCents),
      entry_tier_cents: entryTierCents,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLeague(data as LeagueRow);
}

export async function ensureDefaultPickemLeague(
  contestId: string
): Promise<PickemLeague> {
  return ensurePickemLeagueForTier(contestId, 1000);
}

export async function ensurePickemLeagueForTier(
  contestId: string,
  entryTierCents: number
): Promise<PickemLeague> {
  const existing = await listPickemLeaguesForContest(contestId, entryTierCents);
  if (existing.length > 0) return existing[0];
  return createPickemLeague(contestId, 1, entryTierCents);
}

/** Seed one open league per platform entry tier for a contest. */
export async function ensurePickemLeaguesForAllTiers(
  contestId: string
): Promise<number> {
  let created = 0;
  for (const tier of PLATFORM_ENTRY_TIERS) {
    const leagues = await listPickemLeaguesForContest(contestId, tier.cents);
    if (leagues.length === 0) {
      await createPickemLeague(contestId, 1, tier.cents);
      created += 1;
    }
  }
  return created;
}

export async function getPlayerPickemLeague(
  contestId: string,
  email: string,
  entryTierCents?: number
): Promise<PickemLeague | null> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  let entryQuery = supabase
    .from("pickem_entry_purchases")
    .select("league_id")
    .eq("contest_id", contestId)
    .eq("email", normalized)
    .eq("status", "paid")
    .not("league_id", "is", null);

  if (entryTierCents != null) {
    entryQuery = entryQuery.eq("entry_tier_cents", entryTierCents);
  }

  const { data: entryRow, error: entryError } = await entryQuery
    .limit(1)
    .maybeSingle();

  if (entryError) throw entryError;

  if (entryRow?.league_id) {
    return getPickemLeagueById(entryRow.league_id as string);
  }

  const { data, error } = await supabase
    .from("pickem_picks")
    .select("league_id")
    .eq("contest_id", contestId)
    .eq("email", normalized)
    .not("league_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.league_id) return null;

  const league = await getPickemLeagueById(data.league_id as string);
  if (!league) return null;
  if (entryTierCents != null && league.entryTierCents !== entryTierCents) {
    return null;
  }
  return league;
}

/**
 * Assign player to the first open league shard for their entry tier.
 */
export async function assignPlayerToPickemLeague(
  contest: PickemContest,
  email: string,
  entryTierCents = 1000
): Promise<PickemLeague> {
  const tierCents = isValidEntryTierCents(entryTierCents) ? entryTierCents : 1000;

  const existing = await getPlayerPickemLeague(contest.id, email, tierCents);
  if (existing) return existing;

  let leagues = await listPickemLeaguesForContest(contest.id, tierCents);
  if (!leagues.length) {
    leagues = [await ensurePickemLeagueForTier(contest.id, tierCents)];
  }

  let openLeague = leagues.find(
    (l) => l.status === "open" && l.playerCount < l.maxPlayers
  );

  if (!openLeague) {
    const nextNumber = Math.max(...leagues.map((l) => l.leagueNumber)) + 1;
    openLeague = await createPickemLeague(contest.id, nextNumber, tierCents);
  }

  return openLeague;
}

export async function refreshPickemLeaguePlayerCount(
  leagueId: string
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data: entries, error: entryError } = await supabase
    .from("pickem_entry_purchases")
    .select("email")
    .eq("league_id", leagueId)
    .eq("status", "paid");

  if (entryError) throw entryError;

  const fromEntries = new Set((entries ?? []).map((r) => r.email as string));

  const { data: picks, error } = await supabase
    .from("pickem_picks")
    .select("email")
    .eq("league_id", leagueId);

  if (error) throw error;

  for (const row of picks ?? []) {
    fromEntries.add(row.email as string);
  }

  const playerCount = fromEntries.size;

  const league = await getPickemLeagueById(leagueId);
  if (!league) return 0;

  const status =
    playerCount >= league.maxPlayers
      ? "full"
      : league.status === "complete"
        ? "complete"
        : "open";

  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      player_count: playerCount,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leagueId);

  if (updateError) throw updateError;
  return playerCount;
}

export async function updatePickemLeagueResolutionStatus(
  leagueId: string,
  resolutionStatus: PickemLeague["resolutionStatus"]
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      resolution_status: resolutionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leagueId);

  if (error) throw error;
}

export function formatLeagueLabel(
  leagueNumber: number,
  entryTierCents?: number
): string {
  const tierPart =
    entryTierCents != null
      ? `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(entryTierCents / 100)} · `
      : "";
  return `${tierPart}Pool #${leagueNumber}`;
}

export function formatPoolLabel(leagueNumber: number): string {
  return `Pool #${leagueNumber}`;
}
