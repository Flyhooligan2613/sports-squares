import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderAchievementCard } from "@/lib/seo/og/cards";
import { fetchAchievementShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { username: string; achievementId: string } };

export default async function AchievementOgImage({ params }: Props) {
  const data = await fetchAchievementShareData(params.username, params.achievementId);
  if (!data) return createNotFoundOgImage("Achievement not found");
  return createOgImageResponse(renderAchievementCard(data) as React.ReactElement);
}
