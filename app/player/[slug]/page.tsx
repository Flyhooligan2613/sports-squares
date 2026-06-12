import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicPlayerView from "@/components/player/PublicPlayerView";
import { getPublicPlayerProfile } from "@/lib/database/services/playerProfiles";
import { createClient } from "@/lib/supabase/server";
import { BRAND_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getPublicPlayerProfile(params.slug).catch(() => null);

  if (!profile) {
    return { title: `Player | ${BRAND_NAME}` };
  }

  return {
    title: `${profile.displayName} | ${BRAND_NAME} Legacy`,
    description: profile.headline,
  };
}

export default async function PublicPlayerPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getPublicPlayerProfile(params.slug, user?.email).catch(
    () => null
  );
  if (!profile) notFound();

  return <PublicPlayerView profile={profile} />;
}
