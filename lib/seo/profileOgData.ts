import { buildCompetitorCardBySlug } from "@/lib/competitorCard/buildCompetitorCard";

export interface ProfileOgData {
  username: string;
  displayName: string;
  avatarEmoji: string;
  competitorScore: number;
  rankTitle: string;
  tierName: string;
  worldRankLabel: string;
  headline: string;
}

function formatWorldRankLabel(worldPercentile: number | null): string {
  if (worldPercentile == null || worldPercentile <= 0) return "Unranked";
  return `Top ${worldPercentile}% Worldwide`;
}

/**
 * Lightweight profile payload for OG image generation and metadata.
 * Cached at the route layer via `revalidate`.
 */
export async function getProfileOgData(username: string): Promise<ProfileOgData | null> {
  const card = await buildCompetitorCardBySlug(username).catch(() => null);
  if (!card) return null;

  return {
    username: card.slug,
    displayName: card.identity.displayName,
    avatarEmoji: card.identity.avatarEmoji,
    competitorScore: card.score.total,
    rankTitle: card.score.rankTitle,
    tierName: card.identity.tierName,
    worldRankLabel: formatWorldRankLabel(card.score.percentiles.world),
    headline: card.identity.headline,
  };
}
