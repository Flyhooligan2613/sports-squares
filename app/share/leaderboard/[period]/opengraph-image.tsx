import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderLeaderboardCard } from "@/lib/seo/og/cards";
import { fetchLeaderboardShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const dynamic = ogImageConfig.dynamic;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { period: string } };

export default async function LeaderboardOgImage({ params }: Props) {
  const data = await fetchLeaderboardShareData(params.period);
  if (!data) return createNotFoundOgImage("Leaderboard not found");
  return createOgImageResponse(renderLeaderboardCard(data) as React.ReactElement);
}
