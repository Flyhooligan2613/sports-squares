import type { Metadata } from "next";
import PlayerReferralsHub from "@/components/player/ecosystem/PlayerReferralsHub";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Refer & Earn | ${BRAND_NAME}`,
};

export default function PlayerReferralsPage() {
  return <PlayerReferralsHub />;
}
