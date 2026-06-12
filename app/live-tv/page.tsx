import type { Metadata } from "next";
import LiveTvExperience from "@/components/live-tv/LiveTvExperience";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `LIVE TV | ${BRAND_NAME}`,
  description:
    "SquareBoards LIVE TV — real-time boards, scores, winners, and payouts 24/7.",
};

export default function LiveTvPage() {
  return <LiveTvExperience />;
}
