import { createNotFoundOgImage, createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderProfileCard } from "@/lib/seo/og/cards";
import { fetchProfileShareData } from "@/lib/seo/og/data";

export const runtime = ogImageConfig.runtime;
export const alt = ogImageConfig.alt;
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

interface ImageProps {
  params: { username: string };
}

export default async function ProfileOpenGraphImage({ params }: ImageProps) {
  const profile = await fetchProfileShareData(params.username);
  if (!profile) return createNotFoundOgImage("Profile not found");
  return createOgImageResponse(renderProfileCard(profile) as React.ReactElement);
}
