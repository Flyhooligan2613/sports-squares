import type { Metadata } from "next";
import HomeExperience from "@/components/home/HomeExperience";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Home | ${BRAND_NAME}`,
  description:
    "Your Home on SquareBoards — personalized game day momentum, rewards, community, and everything waiting for you.",
};

export default function MyGamesPage() {
  return <HomeExperience />;
}
