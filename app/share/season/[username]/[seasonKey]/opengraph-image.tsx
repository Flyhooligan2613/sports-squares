import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderSeasonCard } from "@/lib/seo/og/cards";
import { fetchSeasonShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const dynamic = ogImageConfig.dynamic;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { username: string; seasonKey: string } };

export default async function SeasonOgImage({ params }: Props) {
  const data = await fetchSeasonShareData(params.username, params.seasonKey);
  if (!data) return createNotFoundOgImage("Season recap not found");
  return createOgImageResponse(renderSeasonCard(data) as React.ReactElement);
}
