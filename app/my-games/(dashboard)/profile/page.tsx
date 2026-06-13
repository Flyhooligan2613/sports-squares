import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MyProfileClient from "@/components/player/MyProfileClient";
import { BRAND_NAME } from "@/lib/brand";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import {
  ensurePlayerProfile,
  getPublicPlayerProfile,
} from "@/lib/database/services/playerProfiles";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Profile | ${BRAND_NAME}`,
  description: "Your SquareBoards profile — wins, followers, and pick highlights.",
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

  const profile = await getPublicPlayerProfile(slug, user.email);
  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sb-muted">
        Could not load your profile. Try again later.
      </div>
    );
  }

  return <MyProfileClient profile={profile} email={user.email} />;
}
