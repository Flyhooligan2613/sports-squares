import { Suspense } from "react";
import TournamentRoyaleBracketClient from "@/components/tournamentRoyale/TournamentRoyaleBracketClient";
import { TOURNAMENT_ROYALE_PUBLIC_NAME } from "@/lib/tournamentRoyale/config";

export const metadata = {
  title: `Live Bracket | ${TOURNAMENT_ROYALE_PUBLIC_NAME}`,
  description: "Interactive live bracket — picks glow, winners advance, XP flows automatically.",
};

export default function TournamentRoyaleBracketPage() {
  return (
    <Suspense fallback={null}>
      <TournamentRoyaleBracketClient />
    </Suspense>
  );
}
