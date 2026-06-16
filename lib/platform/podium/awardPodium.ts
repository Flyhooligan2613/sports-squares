import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { publishPlatformEvent } from "@/lib/events/engine";
import { normalizeEmail } from "@/lib/player/statsCore";
import { earnTierCredits } from "@/lib/platform/ecosystem/credits";
import { addInventoryItem } from "@/lib/platform/ecosystem/inventory";
import {
  getPodiumConfig,
  podiumRewardSource,
  PODIUM_HUDDLE_TEMPLATES,
} from "@/lib/platform/podium/config";
import {
  calculateLegacyWinnerPayouts,
  calculatePodiumPayouts,
} from "@/lib/platform/podium/calculatePayouts";
import type {
  PodiumAwardInput,
  PodiumAwardResult,
  PodiumCareerStats,
  PodiumContestKind,
  PodiumPlacement,
  PodiumRewardPackage,
} from "@/lib/platform/podium/types";

const FINISHES_TABLE = "podium_finishes";

async function alreadyAwarded(source: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("player_credit_ledger")
    .select("*", { count: "exact", head: true })
    .eq("source", source);

  if (error) throw error;
  return (count ?? 0) > 0;
}

async function grantPackage(input: {
  email: string;
  pkg: PodiumRewardPackage;
  source: string;
  contestKind: PodiumContestKind;
  contestId: string;
  placement: number;
  label: string;
}): Promise<void> {
  if (input.pkg.tierCredits > 0) {
    if (!(await alreadyAwarded(input.source))) {
      await earnTierCredits({
        email: input.email,
        amount: input.pkg.tierCredits,
        source: input.source,
        gameType: input.contestKind,
        metadata: {
          contestId: input.contestId,
          placement: input.placement,
        },
      });
    }
  }

  if (input.pkg.inventoryBadge) {
    await addInventoryItem({
      email: input.email,
      itemType: "badge",
      title: `Podium ${input.placement === 1 ? "Gold" : input.placement === 2 ? "Silver" : "Bronze"}`,
      source: "podium_award",
      metadata: {
        badgeId: input.pkg.inventoryBadge,
        contestId: input.contestId,
        placement: input.placement,
        label: input.label,
      },
    });
  }
}

export async function storePodiumFinish(input: {
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
}): Promise<boolean> {
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

/**
 * Orchestrate podium rewards via existing ecosystem services.
 * Does not duplicate reward logic — delegates to RewardCore™ primitives.
 */
export async function awardPodium(input: PodiumAwardInput): Promise<PodiumAwardResult> {
  const errors: string[] = [];
  let recordsStored = 0;
  let eventsPublished = 0;

  const payouts = input.config.usePodiumCashSplit
    ? calculatePodiumPayouts({
        prizePoolCents: input.prizePoolCents,
        placements: input.resolution.placements,
        cashSplit: input.config.cashSplit,
      })
    : calculateLegacyWinnerPayouts({
        prizePoolCents: input.prizePoolCents,
        winnerEmails: input.resolution.placements
          .filter((p) => p.placement === 1)
          .map((p) => p.email),
      });

  const packageByPlacement: Record<PodiumPlacement, PodiumRewardPackage> = {
    1: input.config.firstPlaceBonus,
    2: input.config.secondPlaceBonus,
    3: input.config.thirdPlacePackage,
  };

  for (const placement of input.resolution.placements) {
    const cash =
      payouts.find(
        (p) =>
          p.email.toLowerCase() === placement.email.toLowerCase() &&
          p.placement === placement.placement
      )?.amountCents ?? 0;

    const pkg = packageByPlacement[placement.placement];
    const source = podiumRewardSource(
      input.contestKind,
      input.contestId,
      placement.email,
      placement.placement
    );

    try {
      await grantPackage({
        email: placement.email,
        pkg,
        source,
        contestKind: input.contestKind,
        contestId: input.contestId,
        placement: placement.placement,
        label: input.label,
      });

      const stored = await storePodiumFinish({
        email: placement.email,
        contestKind: input.contestKind,
        contestId: input.contestId,
        leagueId: input.leagueId,
        sport: input.sport,
        seasonYear: input.seasonYear,
        placement: placement.placement,
        cashCents: cash,
        platformRewards: pkg as unknown as Record<string, unknown>,
        idempotencyKey: `finish:${input.contestKind}:${input.contestId}:${placement.email}:p${placement.placement}`,
      });
      if (stored) recordsStored += 1;

      const huddleKey =
        placement.placement === 1
          ? "first"
          : placement.placement === 2
            ? "second"
            : "third";

      await publishPlatformEvent({
        type: "podium.awarded",
        priority: placement.placement === 1 ? "high" : "normal",
        summary: PODIUM_HUDDLE_TEMPLATES[huddleKey]
          .replace("{player}", placement.email)
          .replace("{contest}", input.label),
        gameType: input.sport ?? input.contestKind,
        entityType: "podium_finish",
        entityId: `${input.contestId}:${placement.email}`,
        actorEmail: placement.email,
        payload: {
          placement: placement.placement,
          cashCents: cash,
          contestKind: input.contestKind,
          contestId: input.contestId,
          leagueId: input.leagueId,
          tierCredits: pkg.tierCredits,
          competitorScoreBonus: pkg.competitorScoreBonus ?? 0,
        },
        idempotencyKey: `podium:event:${input.contestId}:${placement.email}:p${placement.placement}`,
      }).catch(() => undefined);
      eventsPublished += 1;
    } catch (err) {
      errors.push(
        err instanceof Error
          ? `${placement.email} p${placement.placement}: ${err.message}`
          : `${placement.email}: award failed`
      );
    }
  }

  if (input.config.nearPerfect.enabled) {
    for (const candidate of input.resolution.nearPerfect) {
      const source = podiumRewardSource(
        input.contestKind,
        input.contestId,
        candidate.email,
        0
      );

      try {
        if (!(await alreadyAwarded(`${source}:near`))) {
          await earnTierCredits({
            email: candidate.email,
            amount: input.config.nearPerfect.tierCredits,
            source: `${source}:near`,
            gameType: input.contestKind,
            metadata: {
              contestId: input.contestId,
              nearPerfect: true,
              rank: candidate.rank,
            },
          });
        }

        const stored = await storePodiumFinish({
          email: candidate.email,
          contestKind: input.contestKind,
          contestId: input.contestId,
          leagueId: input.leagueId,
          sport: input.sport,
          seasonYear: input.seasonYear,
          placement: 3,
          nearPerfect: true,
          cashCents: 0,
          platformRewards: { nearPerfect: true },
          idempotencyKey: `finish:${input.contestKind}:${input.contestId}:${candidate.email}:near`,
        });
        if (stored) recordsStored += 1;

        await publishPlatformEvent({
          type: "podium.near_perfect",
          priority: "normal",
          summary: PODIUM_HUDDLE_TEMPLATES.nearPerfect
            .replace("{player}", candidate.email)
            .replace("{contest}", input.label),
          gameType: input.sport ?? input.contestKind,
          entityType: "podium_near_perfect",
          entityId: `${input.contestId}:${candidate.email}`,
          actorEmail: candidate.email,
          payload: {
            rank: candidate.rank,
            gapFromThird: candidate.gapFromThird,
            contestId: input.contestId,
          },
          idempotencyKey: `podium:near:${input.contestId}:${candidate.email}`,
        }).catch(() => undefined);
        eventsPublished += 1;
      } catch (err) {
        errors.push(
          err instanceof Error
            ? `${candidate.email} near-perfect: ${err.message}`
            : `${candidate.email}: near-perfect failed`
        );
      }
    }
  }

  return { payouts, recordsStored, eventsPublished, errors };
}

/** Convenience — load config and award in one call. */
export async function awardPodiumWithDefaults(
  input: Omit<PodiumAwardInput, "config">
): Promise<PodiumAwardResult> {
  const config = await getPodiumConfig();
  return awardPodium({ ...input, config });
}
