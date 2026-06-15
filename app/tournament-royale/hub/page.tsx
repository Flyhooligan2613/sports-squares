import { Suspense } from "react";
import TournamentRoyaleHubClient from "@/components/tournamentRoyale/TournamentRoyaleHubClient";
import { TOURNAMENT_ROYALE_PUBLIC_NAME } from "@/lib/tournamentRoyale/config";

export const metadata = {
  title: `Tournament Hub | ${TOURNAMENT_ROYALE_PUBLIC_NAME}`,
  description: "Your tournament headquarters — accuracy, rank, Cinderella Meter™, and live map.",
};

export default function TournamentRoyaleHubPage() {
  return (
    <Suspense fallback={null}>
      <TournamentRoyaleHubClient />
    </Suspense>
  );
}
