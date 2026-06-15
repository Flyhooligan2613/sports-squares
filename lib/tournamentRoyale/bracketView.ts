import { getTournamentEntry } from "@/lib/tournamentRoyale/db/entries";
import { getActiveTournamentEvent } from "@/lib/tournamentRoyale/db/events";
import { listMatchupsForEvent } from "@/lib/tournamentRoyale/db/matchups";
import { getGlobalPoolForEvent } from "@/lib/tournamentRoyale/db/pools";
import { listPicksForEntry } from "@/lib/tournamentRoyale/db/picks";
import { listRoundsForEvent } from "@/lib/tournamentRoyale/db/rounds";
import type {
  BracketMatchupView,
  BracketRoundView,
  BracketView,
  TournamentKey,
} from "@/lib/tournamentRoyale/types";
import { buildTournamentHubView } from "@/lib/tournamentRoyale/hubView";

function isWinningPath(
  teamName: string,
  matchup: { winner_team_name: string | null },
  allMatchups: Awaited<ReturnType<typeof listMatchupsForEvent>>
): boolean {
  if (!matchup.winner_team_name || matchup.winner_team_name !== teamName) return false;

  let current = allMatchups.find((m) => m.winner_team_name === teamName);
  while (current) {
    const parent = allMatchups.find((m) => m.advances_to_matchup_id === current!.id);
    if (!parent) break;
    if (parent.winner_team_name !== teamName) return false;
    current = parent;
  }
  return true;
}

export async function buildBracketView(input: {
  tournamentKey: TournamentKey;
  email?: string | null;
}): Promise<BracketView | null> {
  const hub = await buildTournamentHubView(input);
  if (!hub) return null;

  const event = await getActiveTournamentEvent(input.tournamentKey);
  if (!event) return null;

  const pool = await getGlobalPoolForEvent(event.id);
  if (!pool) return null;

  const rounds = await listRoundsForEvent(event.id);
  const matchups = await listMatchupsForEvent(event.id);

  let picks: Awaited<ReturnType<typeof listPicksForEntry>> = [];
  if (input.email) {
    const entry = await getTournamentEntry(pool.id, input.email);
    if (entry) picks = await listPicksForEntry(entry.id);
  }

  const pickMap = new Map(picks.map((p) => [p.matchup_id, p]));
  const now = Date.now();

  const roundViews: BracketRoundView[] = rounds.map((round) => {
    const roundMatchups = matchups.filter((m) => m.round_id === round.id);
    const picksLocked =
      round.status === "locked" ||
      round.status === "complete" ||
      round.status === "scoring" ||
      (round.locks_at ? new Date(round.locks_at).getTime() <= now : false);

    const matchupViews: BracketMatchupView[] = roundMatchups.map((m) => {
      const pick = pickMap.get(m.id);
      const pickedName = pick?.picked_team_name ?? null;
      const winningPath =
        pickedName != null && m.status === "final"
          ? isWinningPath(pickedName, m, matchups)
          : false;

      return {
        id: m.id,
        slotIndex: m.slot_index,
        region: m.region,
        topTeamName: m.top_team_name,
        topTeamSeed: m.top_team_seed,
        bottomTeamName: m.bottom_team_name,
        bottomTeamSeed: m.bottom_team_seed,
        winnerTeamName: m.winner_team_name,
        status: m.status,
        topScore: m.top_score,
        bottomScore: m.bottom_score,
        pickedTeamName: pickedName,
        isCorrect: pick?.is_correct ?? null,
        isUpset: pick?.is_upset ?? false,
        pointsEarned: pick?.points_earned ?? 0,
        cinderellaPoints: pick?.cinderella_points ?? 0,
        isWinningPath: winningPath,
        picksLocked,
      };
    });

    return {
      id: round.id,
      roundNumber: round.round_number,
      label: round.label,
      status: round.status,
      matchups: matchupViews,
    };
  });

  const canPick =
    hub.event.status === "open" || hub.event.status === "active";

  return {
    event: hub.event,
    entry: hub.entry,
    rounds: roundViews,
    canPick,
  };
}

export async function updateBracketCompletion(
  entryId: string,
  tournamentKey: TournamentKey
): Promise<number> {
  const event = await getActiveTournamentEvent(tournamentKey);
  if (!event) return 0;

  const matchups = await listMatchupsForEvent(event.id);
  const pickable = matchups.filter((m) => m.top_team_name !== "TBD");
  if (!pickable.length) return 0;

  const picks = await listPicksForEntry(entryId);
  const pct = Math.round((picks.length / pickable.length) * 100);

  const { updateEntryCompletion } = await import("@/lib/tournamentRoyale/db/picks");
  await updateEntryCompletion(entryId, pct);
  return pct;
}
