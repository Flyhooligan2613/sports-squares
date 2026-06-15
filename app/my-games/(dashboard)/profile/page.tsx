import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MyProfileClient from "@/components/player/MyProfileClient";
import { buildCompetitorCard } from "@/lib/competitorCard/buildCompetitorCard";
import { BRAND_NAME } from "@/lib/brand";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import {
  ensurePlayerProfile,
} from "@/lib/database/services/playerProfiles";
import { createClient } from "@/lib/supabase/server";
import { PLAYER_TERMS } from "@/lib/platform/language";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${PLAYER_TERMS.competitorCard} | ${BRAND_NAME}`,
  description: "Your Competitor Card — reputation, legacy, achievements, and competition history.",
};

export default async function MyGamesProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/my-games/login");
  }

  const legacy = await getPlayerLegacy(user.email);
  if (!legacy) {
    redirect("/my-games/login");
  }

  const slug = await ensurePlayerProfile(user.email, legacy.publicLabel);
  if (!slug) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sb-muted">
        Could not load your profile. Try again later.
      </div>
    );
  }

  const competitorCard = await buildCompetitorCard({
    email: user.email,
    slug,
    mode: "own",
    viewerEmail: user.email,
  }).catch(() => null);

  return (
    <MyProfileClient
      email={user.email}
      slug={slug}
      initialCompetitorCard={competitorCard}
    />
  );
}
