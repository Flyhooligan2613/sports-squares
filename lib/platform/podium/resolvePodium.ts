import type {
  NearPerfectCandidate,
  NearPerfectConfig,
  PodiumPlacement,
  PodiumPlacementResult,
  PodiumResolution,
  PodiumStandingInput,
} from "@/lib/platform/podium/types";

function groupByScore(
  standings: PodiumStandingInput[]
): Array<{ score: number; players: PodiumStandingInput[] }> {
  const groups: Array<{ score: number; players: PodiumStandingInput[] }> = [];

  for (const row of standings) {
    const last = groups[groups.length - 1];
    if (last && last.score === row.score) {
      last.players.push(row);
    } else {
      groups.push({ score: row.score, players: [row] });
    }
  }

  return groups;
}

/**
 * Given pre-sorted standings (best first), return 1st/2nd/3rd placements
 * and Near Perfect™ candidates who narrowly missed the podium.
 */
export function resolvePodium(input: {
  standings: PodiumStandingInput[];
  nearPerfectConfig: NearPerfectConfig;
  /** Emails occupying 1st after tiebreaker — overrides score grouping for place 1. */
  firstPlaceEmails?: string[];
}): PodiumResolution {
  const sorted = [...input.standings].sort((a, b) => a.rank - b.rank);
  const groups = groupByScore(sorted);

  const placements: PodiumPlacementResult[] = [];
  let placementCursor: PodiumPlacement = 1;

  const firstOverride = new Set(
    (input.firstPlaceEmails ?? []).map((e) => e.toLowerCase())
  );

  if (firstOverride.size > 0) {
    const firstPlayers = sorted.filter((s) =>
      firstOverride.has(s.email.toLowerCase())
    );
    for (const player of firstPlayers) {
      placements.push({
        placement: 1,
        email: player.email,
        rank: player.rank,
        score: player.score,
        splitCount: firstPlayers.length,
        metadata: player.metadata,
      });
    }
    placementCursor = 2;
  }

  for (const group of groups) {
    if (placementCursor > 3) break;

    const remaining = group.players.filter(
      (p) => !placements.some((x) => x.email.toLowerCase() === p.email.toLowerCase())
    );
    if (!remaining.length) continue;

    const placement = placementCursor as PodiumPlacement;
    for (const player of remaining) {
      placements.push({
        placement,
        email: player.email,
        rank: player.rank,
        score: player.score,
        splitCount: remaining.length,
        metadata: player.metadata,
      });
    }

    placementCursor = (placementCursor + 1) as PodiumPlacement;
  }

  const third = placements.filter((p) => p.placement === 3);
  const thirdScore = third[0]?.score ?? null;
  const thirdRank = third[0]?.rank ?? null;

  const nearPerfect: NearPerfectCandidate[] = [];
  if (
    input.nearPerfectConfig.enabled &&
    thirdScore != null &&
    thirdRank != null
  ) {
    const placedEmails = new Set(placements.map((p) => p.email.toLowerCase()));

    for (const row of sorted) {
      if (placedEmails.has(row.email.toLowerCase())) continue;
      const rankGap = row.rank - thirdRank;
      if (rankGap <= 0 || rankGap > input.nearPerfectConfig.maxRankGap) continue;

      const scoreGap = thirdScore - row.score;
      if (scoreGap < 0 || scoreGap > input.nearPerfectConfig.maxScoreGap) continue;

      nearPerfect.push({
        email: row.email,
        rank: row.rank,
        score: row.score,
        gapFromThird: scoreGap,
      });
    }
  }

  const topTen = sorted.slice(0, 10);

  return { placements, nearPerfect, topTen };
}

/** Convert raw standings rows into ranked PodiumStandingInput[]. */
export function rankStandings<T extends { email: string; score: number }>(
  rows: T[],
  scoreAccessor: (row: T) => number = (r) => r.score
): PodiumStandingInput[] {
  const sorted = [...rows].sort((a, b) => scoreAccessor(b) - scoreAccessor(a));
  return sorted.map((row, index) => ({
    email: row.email,
    rank: index + 1,
    score: scoreAccessor(row),
    metadata: row as unknown as Record<string, unknown>,
  }));
}
