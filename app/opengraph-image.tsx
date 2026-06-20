import { createOgImageResponse, ogImageConfig } from "@/lib/seo/og/response";
import { renderHomeCard } from "@/lib/seo/og/cards";
import { OG_BRAND } from "@/lib/seo/og/design";
import { SITE_DESCRIPTION } from "@/lib/seo/site";

export const runtime = ogImageConfig.runtime;
export const alt = "SquareBoards — Premium Multi-Game Competitive Sports Platform";
export const size = ogImageConfig.size;
export const contentType = ogImageConfig.contentType;
export const revalidate = ogImageConfig.revalidate;

export default async function HomeOpenGraphImage() {
  return createOgImageResponse(
    renderHomeCard({
      title: "SquareBoards™",
      tagline: OG_BRAND.tagline,
      description: SITE_DESCRIPTION,
    }) as React.ReactElement
  );
}
