/** Phase 1: Supabase writes + localStorage fallback reads. Phase 2: Supabase only. */
export function getDbReadPhase(): 1 | 2 {
  return process.env.NEXT_PUBLIC_DB_READ_PHASE === "2" ? 2 : 1;
}

export function isPhase2Read(): boolean {
  return getDbReadPhase() === 2;
}

export const TABLES = {
  pools: "pools",
  players: "players",
  squares: "squares",
  winners: "winners",
  games: "games",
  supportThreads: "support_threads",
  supportMessages: "support_messages",
} as const;
