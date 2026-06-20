import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderContestCard } from "@/lib/seo/og/cards";
import { fetchContestShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { id: string } };

export default async function ContestOgImage({ params }: Props) {
  const data = await fetchContestShareData(params.id);
  if (!data) return createNotFoundOgImage("Contest not found");
  return createOgImageResponse(renderContestCard(data) as React.ReactElement);
}
