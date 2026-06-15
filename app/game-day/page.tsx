import type { Metadata } from "next";
import GameDayHubClient from "@/components/game-day/GameDayHubClient";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Game Day Hub | ${BRAND_NAME}`,
  description:
    "Your personalized Game Day Experience — squares, Pick'em, Survivor, rewards, and community momentum in one ritual.",
};

export default function GameDayPage() {
  return <GameDayHubClient />;
}
