import type { Metadata } from "next";
import LiveArenaExperience from "@/components/live-arena/LiveArenaExperience";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Live Arena Prototype | ${BRAND_NAME}`,
  description:
    "PROJECT LIVE ARENA™ — interactive SquareBoards live contest prototype. Cinematic boards, live scoring, and premium sports technology demo.",
  robots: { index: false, follow: false },
};

export default function LiveArenaPage() {
  return <LiveArenaExperience />;
}
