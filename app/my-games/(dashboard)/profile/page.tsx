import type { Metadata } from "next";
import PlayerLegacyProfile from "@/components/player/PlayerLegacyProfile";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Profile | ${BRAND_NAME}`,
  description: "Your SquareBoards legacy — wins, streaks, and achievements.",
};

export default function MyGamesProfilePage() {
  return <PlayerLegacyProfile />;
}
