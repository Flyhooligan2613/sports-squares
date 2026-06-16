import type {
  PodiumContestAdapter,
  PodiumContestKind,
  PodiumContestResult,
  PodiumOutcome,
} from "@/lib/platform/engines/podium/types";
import { publishPlatformEvent } from "@/lib/events/engine";
import { awardPodium } from "@/lib/platform/engines/podium/awardPodium";
import { buildPodiumCeremony } from "@/lib/platform/engines/podium/ceremony";
import { getPodiumConfig, getPodiumEngineConfig } from "@/lib/platform/engines/podium/config";
import { getPodiumAdapter } from "@/lib/platform/engines/podium/registry";
import { resolvePodium } from "@/lib/platform/engines/podium/resolvePodium";

const EMPTY_AWARD = {
  payouts: [],
  recordsStored: 0,
  eventsPublished: 0,
  errors: [] as string[],
};

/**
 * Single PodiumEngine™ pipeline: resolve → payouts → awards → ceremony → adapter hooks.
 * All reward integrations flow through awardPodium + EventEngine subscribers.
 */
export async function orchestratePodium(input: {
  contestResult: PodiumContestResult;
  adapter?: PodiumContestAdapter;
}): Promise<PodiumOutcome> {
  const adapter = input.adapter ?? getPodiumAdapter(input.contestResult.kind);
  const config =
    (await adapter.getConfig?.()) ?? (await getPodiumConfig(input.contestResult.kind));

  const standings = await adapter.resolveStandings(input.contestResult);
  const resolution = resolvePodium({
    standings,
    nearPerfectConfig: config.nearPerfect,
    firstPlaceEmails: input.contestResult.firstPlaceEmails,
  });

  if (!config.enabled) {
    return {
      resolution,
      award: { ...EMPTY_AWARD },
      ceremony: null,
      podiumEnabled: false,
      errors: [],
    };
  }

  const prizePoolCents = await adapter.getPrizePool(input.contestResult);
  const award = await awardPodium({
    contestKind: input.contestResult.kind,
    contestId: input.contestResult.contestId,
    leagueId: input.contestResult.leagueId,
    sport: input.contestResult.sport,
    seasonYear: input.contestResult.seasonYear,
    prizePoolCents,
    resolution,
    config,
    label: input.contestResult.label,
  });

  const engineConfig = await getPodiumEngineConfig();
  const ceremony = buildPodiumCeremony({
    contestKind: input.contestResult.kind,
    contestId: input.contestResult.contestId,
    label: input.contestResult.label,
    resolution,
    templates: engineConfig.ceremonyTemplates,
    metadata: {
      sport: input.contestResult.sport,
      leagueId: input.contestResult.leagueId,
      seasonYear: input.contestResult.seasonYear,
    },
  });

  await publishPlatformEvent({
    type: "podium.ceremony",
    priority: "high",
    summary: ceremony.headline,
    gameType: input.contestResult.sport ?? input.contestResult.kind,
    entityType: "podium_ceremony",
    entityId: input.contestResult.contestId,
    payload: {
      headline: ceremony.headline,
      summary: ceremony.summary,
      placements: ceremony.placements.map((p) => ({
        email: p.email,
        placement: p.placement,
        rank: p.rank,
      })),
      nearPerfect: ceremony.nearPerfect.map((n) => ({
        email: n.email,
        rank: n.rank,
      })),
      contestKind: input.contestResult.kind,
      contestId: input.contestResult.contestId,
      label: input.contestResult.label,
    },
    idempotencyKey: `podium:ceremony:${input.contestResult.kind}:${input.contestResult.contestId}`,
  }).catch(() => undefined);

  if (adapter.onAwarded) {
    try {
      await adapter.onAwarded({
        contestResult: input.contestResult,
        resolution,
        award,
      });
    } catch (err) {
      award.errors.push(
        err instanceof Error ? err.message : "adapter onAwarded failed"
      );
    }
  }

  return {
    resolution,
    award,
    ceremony,
    podiumEnabled: true,
    errors: award.errors,
  };
}

export function assertPodiumAdapterRegistered(kind: PodiumContestKind): void {
  getPodiumAdapter(kind);
}
