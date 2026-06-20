import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderReferralCard } from "@/lib/seo/og/cards";
import { fetchReferralShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const dynamic = ogImageConfig.dynamic;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

type Props = { params: { code: string } };

export default async function ReferralOgImage({ params }: Props) {
  const data = await fetchReferralShareData(params.code);
  if (!data) return createNotFoundOgImage("Referral not found");
  return createOgImageResponse(renderReferralCard(data) as React.ReactElement);
}
