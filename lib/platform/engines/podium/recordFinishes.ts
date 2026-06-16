import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  PodiumCareerStats,
  PodiumContestKind,
  PodiumPlacement,
} from "@/lib/platform/engines/podium/types";

const FINISHES_TABLE = "podium_finishes";

export interface RecordPodiumFinishInput {
  email: string;
  contestKind: PodiumContestKind;
  contestId: string;
  leagueId?: string | null;
  sport?: string;
  seasonYear?: number;
  placement: PodiumPlacement;
  nearPerfect?: boolean;
  cashCents: number;
  platformRewards?: Record<string, unknown>;
  idempotencyKey: string;
}

/**
 * Single path for Competitor Card / career stats — all podium outcomes flow here.
 */
export async function recordPodiumFinishes(
  input: RecordPodiumFinishInput
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(FINISHES_TABLE).insert({
    email: normalizeEmail(input.email),
    contest_kind: input.contestKind,
    contest_id: input.contestId,
    league_id: input.leagueId ?? null,
    sport: input.sport ?? null,
    season_year: input.seasonYear ?? null,
    placement: input.placement,
    near_perfect: input.nearPerfect ?? false,
    cash_cents: input.cashCents,
    platform_rewards: input.platformRewards ?? {},
    idempotency_key: input.idempotencyKey,
  });

  if (error?.code === "23505") return false;
  if (error) throw error;
  return true;
}

/** @deprecated Use recordPodiumFinishes — kept for backward compatibility. */
export const storePodiumFinish = recordPodiumFinishes;

export async function getPodiumCareerStats(email: string): Promise<PodiumCareerStats> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data, error } = await supabase
    .from(FINISHES_TABLE)
    .select("placement, near_perfect")
    .eq("email", normalized);

  if (error) throw error;

  const stats: PodiumCareerStats = {
    championships: 0,
    runnerUp: 0,
    thirdPlace: 0,
    topTen: 0,
    nearPerfect: 0,
  };

  for (const row of data ?? []) {
    if (row.near_perfect) {
      stats.nearPerfect += 1;
      continue;
    }
    switch (row.placement as number) {
      case 1:
        stats.championships += 1;
        break;
      case 2:
        stats.runnerUp += 1;
        break;
      case 3:
        stats.thirdPlace += 1;
        break;
      default:
        break;
    }
  }

  const { count: topTenCount } = await supabase
    .from(FINISHES_TABLE)
    .select("*", { count: "exact", head: true })
    .eq("email", normalized)
    .lte("placement", 10)
    .eq("near_perfect", false);

  stats.topTen = topTenCount ?? stats.championships + stats.runnerUp + stats.thirdPlace;

  return stats;
}
