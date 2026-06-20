import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderLevelUpCard } from "@/lib/seo/og/cards";
import { fetchLevelUpShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { username: string; tierSlug: string } };

export default async function LevelUpOgImage({ params }: Props) {
  const data = await fetchLevelUpShareData(params.username, params.tierSlug);
  if (!data) return createNotFoundOgImage("Level up not found");
  return createOgImageResponse(renderLevelUpCard(data) as React.ReactElement);
}
