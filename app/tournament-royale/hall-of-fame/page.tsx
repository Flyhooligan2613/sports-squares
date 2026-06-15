import TournamentRoyaleHallOfFameClient from "@/components/tournamentRoyale/TournamentRoyaleHallOfFameClient";
import { TOURNAMENT_ROYALE_PUBLIC_NAME } from "@/lib/tournamentRoyale/config";

export const metadata = {
  title: `Hall of Fame | ${TOURNAMENT_ROYALE_PUBLIC_NAME}`,
  description: "Tournament Royale™ legends — champions, upset oracles, and combo legends.",
};

export default function TournamentRoyaleHallOfFamePage() {
  return <TournamentRoyaleHallOfFameClient />;
}
