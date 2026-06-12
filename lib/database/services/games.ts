import type { EspnSport, Game, GameStatus } from "@/lib/types";
import { TABLES } from "../config";
import type { GameRow } from "../types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function rowToGame(row: GameRow): Game {
  return {
    id: row.id,
    espnGameId: row.espn_game_id,
    espnSport: row.espn_sport,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    kickoffAt: row.kickoff_at,
    status: row.status,
  };
}

export function mapEspnStatusToGameStatus(
  completed?: boolean,
  statusText?: string
): GameStatus {
  if (completed) return "final";
  const lower = (statusText ?? "").toLowerCase();
  if (
    lower.includes("live") ||
    lower.includes("progress") ||
    lower.includes("half") ||
    lower.includes("quarter") ||
    lower.includes("period")
  ) {
    return "live";
  }
  if (lower.includes("cancel") || lower.includes("postpon")) {
    return "cancelled";
  }
  return "scheduled";
}

export async function dbUpsertGame(input: {
  espnGameId: string;
  espnSport: EspnSport;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  status: GameStatus;
}): Promise<Game> {
  const supabase = getSupabaseAdmin();
  const id = `${input.espnSport}-${input.espnGameId}`;

  const row = {
    id,
    espn_game_id: input.espnGameId,
    espn_sport: input.espnSport,
    home_team: input.homeTeam,
    away_team: input.awayTeam,
    kickoff_at: input.kickoffAt,
    status: input.status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLES.games)
    .upsert(row, { onConflict: "espn_sport,espn_game_id" })
    .select("*")
    .single();

  if (error) throw error;
  return rowToGame(data as GameRow);
}

export async function dbListGames(options?: {
  sport?: EspnSport;
  status?: GameStatus[];
  fromKickoff?: string;
  limit?: number;
}): Promise<Game[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(TABLES.games)
    .select("*")
    .order("kickoff_at", { ascending: true });

  if (options?.sport) {
    query = query.eq("espn_sport", options.sport);
  }
  if (options?.status?.length) {
    query = query.in("status", options.status);
  }
  if (options?.fromKickoff) {
    query = query.gte("kickoff_at", options.fromKickoff);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as GameRow[]).map(rowToGame);
}

export async function dbGetGame(gameId: string): Promise<Game | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.games)
    .select("*")
    .eq("id", gameId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToGame(data as GameRow) : null;
}

export function buildGameId(sport: EspnSport, espnGameId: string): string {
  return `${sport}-${espnGameId}`;
}

export function buildGamePoolName(
  awayTeam: string,
  homeTeam: string,
  kickoffAt: string,
  boardIndex: number
): string {
  const date = new Date(kickoffAt);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${awayTeam} @ ${homeTeam} — ${dateLabel} ${timeLabel} · Board ${boardIndex}`;
}
