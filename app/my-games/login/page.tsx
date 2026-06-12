import type { Metadata } from "next";
import PlayerLoginForm from "@/components/player/PlayerLoginForm";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Sign In | ${BRAND_NAME}`,
  description: "Access your boards, live scores, and winnings.",
};

export default function MyGamesLoginPage() {
  return <PlayerLoginForm />;
}
