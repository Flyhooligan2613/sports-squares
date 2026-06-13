export type StatsHubSport = "nfl" | "nba" | "mlb" | "nhl" | "soccer";

export interface TeamStandingRow {
  rank: number;
  team: string;
  abbreviation: string;
  logoUrl: string | null;
  wins: number;
  losses: number;
  ties: number;
  winPct: string;
  streak: string;
  homeRecord: string;
  awayRecord: string;
  pointsFor: number | null;
  pointsAgainst: number | null;
  gamesBack: string | null;
  playoffSeed: string | null;
  clinched: string | null;
  nextOpponent: string | null;
  lastFive: string | null;
  division: string;
  conference: string;
}

const STANDINGS_URL: Record<StatsHubSport, string> = {
  nfl: "https://site.api.espn.com/apis/v2/sports/football/nfl/standings",
  nba: "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings",
  mlb: "https://site.api.espn.com/apis/v2/sports/baseball/mlb/standings",
  nhl: "https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings",
  soccer: "https://site.api.espn.com/apis/v2/sports/soccer/usa.1/standings",
};

function parseRecord(summary: string | undefined): { wins: number; losses: number; ties: number } {
  if (!summary) return { wins: 0, losses: 0, ties: 0 };
  const parts = summary.split("-").map((p) => parseInt(p, 10));
  return {
    wins: parts[0] ?? 0,
    losses: parts[1] ?? 0,
    ties: parts[2] ?? 0,
  };
}

export async function fetchTeamStandings(sport: StatsHubSport): Promise<TeamStandingRow[]> {
  const url = STANDINGS_URL[sport];
  const response = await fetch(url, {
    headers: { "User-Agent": "SquareBoards/1.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return [];

  const data = (await response.json()) as {
    children?: Array<{
      name?: string;
      abbreviation?: string;
      standings?: {
        entries?: Array<{
          team?: { displayName?: string; abbreviation?: string; logo?: string };
          stats?: Array<{ name?: string; displayValue?: string; value?: number }>;
        }>;
      };
      children?: Array<{
        name?: string;
        standings?: {
          entries?: Array<{
            team?: { displayName?: string; abbreviation?: string; logo?: string };
            stats?: Array<{ name?: string; displayValue?: string; value?: number }>;
          }>;
        };
      }>;
    }>;
  };

  const rows: TeamStandingRow[] = [];

  for (const conference of data.children ?? []) {
    const divisions = conference.children?.length ? conference.children : [conference];
    for (const division of divisions) {
      const divisionName = division.name ?? "Division";
      const conferenceName = conference.name ?? conference.abbreviation ?? "League";

      for (const entry of division.standings?.entries ?? []) {
        const index = (division.standings?.entries ?? []).indexOf(entry);
        const statsList = entry.stats ?? [];
        const stats = new Map(statsList.map((s: { name?: string; displayValue?: string; value?: number }) => [s.name ?? "", s.displayValue ?? String(s.value ?? "")]));
        const overall = stats.get("overall") ?? stats.get("wins") ?? "0-0";
        const record = parseRecord(typeof overall === "string" ? overall : "0-0");
        const home = String(stats.get("Home") ?? stats.get("home") ?? "—");
        const away = String(stats.get("Road") ?? stats.get("away") ?? "—");

        rows.push({
          rank: index + 1,
          team: entry.team?.displayName ?? "Team",
          abbreviation: entry.team?.abbreviation ?? "—",
          logoUrl: entry.team?.logo ?? null,
          wins: record.wins,
          losses: record.losses,
          ties: record.ties,
          winPct: String(stats.get("winPercent") ?? stats.get("winningPercentage") ?? "—"),
          streak: String(stats.get("streak") ?? stats.get("Streak") ?? "—"),
          homeRecord: home,
          awayRecord: away,
          pointsFor: Number(stats.get("pointsFor") ?? stats.get("avgPointsFor") ?? 0) || null,
          pointsAgainst: Number(stats.get("pointsAgainst") ?? stats.get("avgPointsAgainst") ?? 0) || null,
          gamesBack: stats.has("gamesBehind") ? String(stats.get("gamesBehind")) : stats.has("GB") ? String(stats.get("GB")) : null,
          playoffSeed: stats.has("playoffSeed") ? String(stats.get("playoffSeed")) : null,
          clinched: stats.has("clincher") ? String(stats.get("clincher")) : null,
          nextOpponent: null,
          lastFive: stats.has("Last Five") ? String(stats.get("Last Five")) : stats.has("L10") ? String(stats.get("L10")) : null,
          division: divisionName,
          conference: conferenceName,
        });
      }
    }
  }

  return rows;
}
