import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderTrophyCard } from "@/lib/seo/og/cards";
import { fetchTrophyShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const dynamic = ogImageConfig.dynamic;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { username: string; trophyId: string } };

export default async function TrophyOgImage({ params }: Props) {
  const data = await fetchTrophyShareData(params.username, params.trophyId);
  if (!data) return createNotFoundOgImage("Trophy not found");
  return createOgImageResponse(renderTrophyCard(data) as React.ReactElement);
}
