import { Suspense } from "react";
import TournamentRoyaleLandingClient from "@/components/tournamentRoyale/TournamentRoyaleLandingClient";
import { TOURNAMENT_ROYALE_PUBLIC_NAME } from "@/lib/tournamentRoyale/config";

export const metadata = {
  title: `${TOURNAMENT_ROYALE_PUBLIC_NAME} | SquareBoards`,
  description:
    "The world's most immersive tournament prediction experience — Cinderella Meter™, Bracket Combos™, and Bracket Shields™ on SquareBoards.",
};

export default function TournamentRoyalePage() {
  return (
    <Suspense fallback={null}>
      <TournamentRoyaleLandingClient />
    </Suspense>
  );
}
