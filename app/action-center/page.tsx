import type { Metadata } from "next";
import ActionCenter from "@/components/action-center/ActionCenter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Action Center | ${BRAND_NAME}`,
  description:
    "Live games, filling boards, countdowns, and smart play recommendations — the heartbeat of SquareBoards.",
};

export default function ActionCenterPage() {
  return <ActionCenter />;
}
