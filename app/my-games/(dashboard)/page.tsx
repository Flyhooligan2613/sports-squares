import type { Metadata } from "next";
import MyGamesDashboard from "@/components/player/MyGamesDashboard";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `My Games | ${BRAND_NAME}`,
  description: "Your live boards, upcoming games, and winnings — all in one place.",
};

export default function MyGamesPage() {
  return <MyGamesDashboard />;
}
