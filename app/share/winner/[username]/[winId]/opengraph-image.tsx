import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderWinnerCard } from "@/lib/seo/og/cards";
import { fetchWinnerShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { username: string; winId: string } };

export default async function WinnerOgImage({ params }: Props) {
  const data = await fetchWinnerShareData(params.username, params.winId);
  if (!data) return createNotFoundOgImage("Victory not found");
  return createOgImageResponse(renderWinnerCard(data) as React.ReactElement);
}
