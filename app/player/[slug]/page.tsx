import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicPlayerView from "@/components/player/PublicPlayerView";
import { buildCompetitorCardBySlug } from "@/lib/competitorCard/buildCompetitorCard";
import { getEmailForPlayerSlug } from "@/lib/database/services/playerProfiles";
import { createClient } from "@/lib/supabase/server";
import { BRAND_NAME } from "@/lib/brand";
import { PLAYER_TERMS } from "@/lib/platform/language";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const card = await buildCompetitorCardBySlug(params.slug).catch(() => null);

  if (!card) {
    return { title: `${PLAYER_TERMS.competitorProfile} | ${BRAND_NAME}` };
  }

  return {
    title: `${card.identity.displayName} · ${PLAYER_TERMS.competitorCard} | ${BRAND_NAME}`,
    description: card.identity.headline,
  };
}

export default async function PublicPlayerPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = await getEmailForPlayerSlug(params.slug).catch(() => null);
  if (!email) notFound();

  const competitorCard = await buildCompetitorCardBySlug(
    params.slug,
    user?.email,
    "public"
  ).catch(() => null);

  if (!competitorCard) notFound();

  return (
    <PublicPlayerView
      slug={params.slug}
      initialCompetitorCard={competitorCard}
    />
  );
}
