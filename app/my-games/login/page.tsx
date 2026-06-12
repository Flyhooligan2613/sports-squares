import type { Metadata } from "next";
import PlayerLoginPageClient from "./PlayerLoginPageClient";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Sign In | ${BRAND_NAME}`,
  description: "Access your boards, live scores, and winnings.",
};

export default function MyGamesLoginPage() {
  return <PlayerLoginPageClient />;
}
