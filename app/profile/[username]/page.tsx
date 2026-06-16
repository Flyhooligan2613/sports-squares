import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicPlayerView from "@/components/player/PublicPlayerView";
import { buildCompetitorCardBySlug } from "@/lib/competitorCard/buildCompetitorCard";
import { getEmailForPlayerSlug } from "@/lib/database/services/playerProfiles";
import { createClient } from "@/lib/supabase/server";
import { BRAND_NAME } from "@/lib/brand";
import { PLAYER_TERMS } from "@/lib/platform/language";
import { getProfileOgData } from "@/lib/seo/profileOgData";
import { profileUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getProfileOgData(params.username).catch(() => null);

  if (!profile) {
    return {
      title: `${PLAYER_TERMS.competitorProfile} | ${BRAND_NAME}`,
    };
  }

  const title = `${profile.displayName} · ${PLAYER_TERMS.competitorCard}`;
  const description = profile.headline;
  const url = profileUrl(profile.username);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title,
      description,
      siteName: BRAND_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = await getEmailForPlayerSlug(params.username).catch(() => null);
  if (!email) notFound();

  const competitorCard = await buildCompetitorCardBySlug(
    params.username,
    user?.email,
    "public"
  ).catch(() => null);

  if (!competitorCard) notFound();

  return (
    <PublicPlayerView
      slug={params.username}
      initialCompetitorCard={competitorCard}
    />
  );
}
