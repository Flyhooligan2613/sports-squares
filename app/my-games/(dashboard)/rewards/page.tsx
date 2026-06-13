import type { Metadata } from "next";
import PlayerEcosystemHub from "@/components/player/ecosystem/PlayerEcosystemHub";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Rewards & Progression | ${BRAND_NAME}`,
};

export default function PlayerRewardsPage() {
  return <PlayerEcosystemHub />;
}
