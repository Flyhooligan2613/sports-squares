import type { Metadata } from "next";
import PlayerGameDayHub from "@/components/player/PlayerGameDayHub";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Game Day Hub | ${BRAND_NAME}`,
  description:
    "Your personalized Game Day Experience — squares, Pick'em, Survivor, rewards, and community momentum in one command center.",
};

export default function MyGamesPage() {
  return <PlayerGameDayHub />;
}
