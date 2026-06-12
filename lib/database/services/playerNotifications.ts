import { fetchEspnGame } from "@/lib/espn";
import { assemblePool } from "@/lib/database/mappers";
import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PlayerRow, PoolRow, SquareRow, WinnerRow } from "@/lib/database/types";
import { buildPlayerNotifications } from "@/lib/notifications/buildPlayerNotifications";
import { buildPickemNotifications } from "@/lib/pickem/notifications/buildPickemNotifications";
import { buildAnnouncementNotifications } from "@/lib/platform/announcements/buildAnnouncementNotifications";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";
import type { EspnLiveGame, Pool } from "@/lib/types";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function loadEspnGame(
  espnGameId: string | null | undefined,
  espnSport: Pool["espnSport"]
): Promise<EspnLiveGame | null> {
  if (!espnGameId) return null;
  try {
    return await fetchEspnGame(espnGameId, espnSport);
  } catch {
    return null;
  }
}

export async function getPlayerNotifications(
  email: string
): Promise<PlayerNotification[]> {
  if (!isSupabaseAdminConfigured()) return [];

  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: playerRows, error: playersError } = await supabase
    .from(TABLES.players)
    .select("*")
    .ilike("email", normalized);

  if (playersError) throw playersError;

  const announcementNotifications = await buildAnnouncementNotifications(normalized);

  if (!playerRows?.length) {
    return announcementNotifications.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    );
  }

  const players = playerRows as PlayerRow[];
  const poolIds = Array.from(new Set(players.map((p) => p.pool_id)));
  const playerIds = new Set(players.map((p) => p.id));
  const playerNames = new Set(players.map((p) => p.name.trim().toLowerCase()));

  const [poolsRes, squaresRes, winnersRes] = await Promise.all([
    supabase.from(TABLES.pools).select("*").in("id", poolIds),
    supabase.from(TABLES.squares).select("*").in("pool_id", poolIds),
    supabase.from(TABLES.winners).select("*").in("pool_id", poolIds),
  ]);

  if (poolsRes.error) throw poolsRes.error;
  if (squaresRes.error) throw squaresRes.error;
  if (winnersRes.error) throw winnersRes.error;

  const poolRows = (poolsRes.data ?? []) as PoolRow[];
  const squareRows = (squaresRes.data ?? []) as SquareRow[];
  const winnerRows = (winnersRes.data ?? []) as WinnerRow[];

  const pools = poolRows.map((row) =>
    assemblePool(
      row,
      players.filter((p) => p.pool_id === row.id),
      squareRows.filter((s) => s.pool_id === row.id)
    )
  );

  const espnByPool = new Map<string, EspnLiveGame | null>();
  await Promise.all(
    pools.map(async (pool) => {
      const game = await loadEspnGame(pool.espnGameId, pool.espnSport);
      espnByPool.set(pool.id, game);
    })
  );

  const squaresNotifications = buildPlayerNotifications({
    pools,
    players,
    squareRows,
    winnerRows,
    espnByPool,
    playerIds,
    playerNames,
  });

  const pickemNotifications = await buildPickemNotifications(normalized);

  return [...announcementNotifications, ...pickemNotifications, ...squaresNotifications].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}
