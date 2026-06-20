import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderStoryCard } from "@/lib/seo/og/cards";
import { fetchStoryShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const dynamic = ogImageConfig.dynamic;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { username: string; storyId: string } };

export default async function StoryOgImage({ params }: Props) {
  const data = await fetchStoryShareData(params.username, params.storyId);
  if (!data) return createNotFoundOgImage("Story not found");
  return createOgImageResponse(renderStoryCard(data) as React.ReactElement);
}
