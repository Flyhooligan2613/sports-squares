import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";
import type { PoolRow, PlayerRow, SquareRow, WinnerRow } from "@/lib/database/types";
import { normalizeEmail, playerOwnsWin } from "@/lib/player/statsCore";
import { periodShortLabel } from "@/lib/liveWinners/display";
import type { ScoringPeriod } from "@/lib/types";

export interface ProfileWinHighlight {
  id: string;
  homeTeam: string;
  awayTeam: string;
  periodLabel: string;
  winningSquare: number | null;
  amount: number;
  payoutStatus: string;
  wonAt: string;
}

export async function getPlayerWinHighlights(
  email: string,
  limit = 40
): Promise<ProfileWinHighlight[]> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: playerRows, error: playersError } = await supabase
    .from(TABLES.players)
    .select("*")
    .ilike("email", normalized);

  if (playersError) throw playersError;
  if (!playerRows?.length) return [];

  const players = playerRows as PlayerRow[];
  const poolIds = Array.from(new Set(players.map((p) => p.pool_id)));
  const playerIds = new Set(players.map((p) => p.id));
  const playerNames = new Set(players.map((p) => p.name.trim().toLowerCase()));

  const [poolsRes, squaresRes, winnersRes] = await Promise.all([
    supabase.from(TABLES.pools).select("*").in("id", poolIds),
    supabase.from(TABLES.squares).select("*").in("pool_id", poolIds),
    supabase
      .from(TABLES.winners)
      .select("*")
      .in("pool_id", poolIds)
      .order("created_at", { ascending: false })
      .limit(limit * 3),
  ]);

  if (poolsRes.error) throw poolsRes.error;
  if (squaresRes.error) throw squaresRes.error;
  if (winnersRes.error) throw winnersRes.error;

  const poolMap = new Map((poolsRes.data as PoolRow[]).map((p) => [p.id, p]));
  const squareRows = (squaresRes.data ?? []) as SquareRow[];
  const highlights: ProfileWinHighlight[] = [];

  for (const winner of (winnersRes.data ?? []) as WinnerRow[]) {
    const pool = poolMap.get(winner.pool_id);
    if (!pool) continue;

    const ownedSquares = squareRows
      .filter(
        (s) => s.pool_id === pool.id && s.player_id && playerIds.has(s.player_id)
      )
      .map((s) => s.square_number);
    const ownedSet = new Set(ownedSquares);

    if (!playerOwnsWin(winner, playerNames, ownedSet)) continue;

    highlights.push({
      id: winner.id,
      homeTeam: pool.home_team,
      awayTeam: pool.away_team,
      periodLabel: periodShortLabel(winner.quarter as ScoringPeriod),
      winningSquare: winner.winning_square ?? null,
      amount: winner.payout_amount ?? 0,
      payoutStatus: winner.payout_status,
      wonAt: winner.created_at,
    });

    if (highlights.length >= limit) break;
  }

  return highlights.sort(
    (a, b) => new Date(b.wonAt).getTime() - new Date(a.wonAt).getTime()
  );
}
