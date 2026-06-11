import { getDatabaseClient } from "../client";
import { TABLES } from "../config";
import type { DatabaseCounts } from "../types";

export async function dbGetCounts(): Promise<DatabaseCounts> {
  const supabase = getDatabaseClient();

  const [pools, players, squares, winners] = await Promise.all([
    supabase.from(TABLES.pools).select("*", { count: "exact", head: true }),
    supabase.from(TABLES.players).select("*", { count: "exact", head: true }),
    supabase.from(TABLES.squares).select("*", { count: "exact", head: true }),
    supabase.from(TABLES.winners).select("*", { count: "exact", head: true }),
  ]);

  if (pools.error) throw pools.error;
  if (players.error) throw players.error;
  if (squares.error) throw squares.error;
  if (winners.error) throw winners.error;

  return {
    pools: pools.count ?? 0,
    players: players.count ?? 0,
    squares: squares.count ?? 0,
    winners: winners.count ?? 0,
  };
}

export async function dbTestRoundTrip(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const counts = await dbGetCounts();
    return {
      ok: true,
      message: `Database reachable. ${counts.pools} pools, ${counts.players} players, ${counts.squares} squares, ${counts.winners} winners.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Database test failed.",
    };
  }
}
