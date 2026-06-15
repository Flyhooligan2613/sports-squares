import type { ActionCenterData } from "@/lib/actionCenter/types";
import type { GameDayFriendActivity } from "@/lib/gameDay/types";
import { CONTEST_TEMPLATES, templateToListing } from "@/lib/contestCenter/catalog";
import type {
  ContestCenterViewModel,
  ContestFriendActivity,
  ContestListing,
  ContestStatus,
  TrendingBadge,
} from "@/lib/contestCenter/types";

export const LAST_CONTEST_KEY = "squareboards:last-contest";

function formatKickoffLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBD";
  const now = Date.now();
  const diffMs = d.getTime() - now;
  if (diffMs <= 0) return "Live now";
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `Starts in ${hours}h`;
  return d.toLocaleDateString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

function formatPrizePool(amount: number): string {
  if (amount <= 0) return "Growing";
  return `$${Math.round(amount).toLocaleString()}`;
}

function boardStatus(fillPercent: number, isLive: boolean): ContestStatus {
  if (isLive) return "live";
  if (fillPercent >= 100) return "locked";
  if (fillPercent >= 85) return "almost_full";
  if (fillPercent >= 40) return "filling";
  return "open";
}

function buildBoardContests(data: ActionCenterData): ContestListing[] {
  const listings: ContestListing[] = [];

  for (const board of data.fillingFast) {
    const status = boardStatus(board.fillPercent, false);
    listings.push({
      id: `board-${board.poolId}`,
      title: `${board.awayTeam} @ ${board.homeTeam}`,
      subtitle: `Board ${board.boardIndex} · ${board.sport.toUpperCase()} Squares`,
      emoji: "🏈",
      sport: board.sport.toUpperCase(),
      sportKey: board.sport,
      kind: "squares",
      status,
      href: `/pool/${board.poolId}`,
      entryFeeLabel: "From $1",
      durationLabel: "Game day",
      contestType: "Squares",
      accent: "#7b61ff",
      remainingSpots: board.squaresRemaining,
      totalSpots: board.squaresRemaining + Math.round((board.fillPercent / 100) * 100),
      fillPercent: board.fillPercent,
      playersJoined: Math.round((board.fillPercent / 100) * 100),
      prizePoolLabel: "Live pool",
      trendingBadge: board.fillPercent >= 70 ? "filling_fast" : undefined,
      searchTerms: [board.awayTeam, board.homeTeam, board.sport, board.poolId],
    });
  }

  for (const card of data.nowHappening) {
    if (!card.openBoard) continue;
    const fill = card.openBoard.fillPercent;
    listings.push({
      id: `live-${card.gameId}-${card.openBoard.poolId}`,
      title: `${card.awayTeam} @ ${card.homeTeam}`,
      subtitle: card.featuredReason === "live" ? "Live on the board" : "Kickoff approaching",
      emoji: card.sportLabel.includes("MLB") ? "⚾" : card.sportLabel.includes("NBA") ? "🏀" : "🏈",
      sport: card.sportLabel,
      sportKey: card.sport,
      kind: "squares",
      status: boardStatus(fill, card.status === "live"),
      href: `/pool/${card.openBoard.poolId}`,
      kickoffAt: card.kickoffAt,
      gameTimeLabel: formatKickoffLabel(card.kickoffAt),
      entryFeeLabel: "From $1",
      durationLabel: card.status === "live" ? "In progress" : "Game day",
      contestType: "Squares",
      accent: "#7b61ff",
      remainingSpots: card.openBoard.squaresRemaining,
      fillPercent: fill,
      playersJoined: card.openBoard.squaresSold,
      prizePoolLabel: "Live pool",
      trendingBadge: card.hotBadge === "selling_fast" ? "filling_fast" : card.featuredReason === "live" ? "featured" : undefined,
      searchTerms: [card.awayTeam, card.homeTeam, card.sport, card.openBoard.poolId],
    });
  }

  return listings;
}

function pickFeatured(
  templates: ContestListing[],
  boards: ContestListing[],
  data: ActionCenterData
): ContestListing | null {
  const hotBoard = boards.find((b) => (b.fillPercent ?? 0) >= 70);
  if (hotBoard) {
    return {
      ...hotBoard,
      featured: true,
      trendingBadge: "featured" as TrendingBadge,
      title: hotBoard.subtitle?.includes("Squares")
        ? `${hotBoard.sport} Sunday Contest`
        : hotBoard.title,
    };
  }

  const liveCard = data.nowHappening[0];
  if (liveCard?.openBoard) {
    const match = boards.find((b) => b.href === `/pool/${liveCard.openBoard!.poolId}`);
    if (match) {
      return {
        ...match,
        featured: true,
        title: `${liveCard.sportLabel} Contest`,
        subtitle: `${liveCard.awayTeam} @ ${liveCard.homeTeam}`,
        trendingBadge: "featured",
      };
    }
  }

  const nflSquares = templates.find((t) => t.id === "nfl-squares");
  if (nflSquares) {
    return {
      ...nflSquares,
      featured: true,
      title: "NFL Sunday Contest",
      subtitle: "Sports Squares™ — join before kickoff",
      trendingBadge: "featured",
      playersJoined: data.platform.playersOnline,
      prizePoolLabel: formatPrizePool(data.platform.moneyInPlay),
    };
  }

  return templates[0] ?? null;
}

function buildTrending(templates: ContestListing[], boards: ContestListing[]): ContestListing[] {
  const tagged = new Map<string, ContestListing>();

  for (const board of boards) {
    if ((board.fillPercent ?? 0) >= 60) {
      tagged.set(board.id, { ...board, trendingBadge: "filling_fast" });
    }
  }

  for (const t of templates) {
    if (t.filterTags?.includes("trending") && !tagged.has(t.id)) {
      tagged.set(t.id, { ...t, trendingBadge: t.trendingBadge ?? "most_popular" });
    }
  }

  const highest = [...boards].sort((a, b) => (b.fillPercent ?? 0) - (a.fillPercent ?? 0))[0];
  if (highest) {
    tagged.set(`prize-${highest.id}`, { ...highest, trendingBadge: "highest_prize" });
  }

  const newest = templates.find((t) => t.filterTags?.includes("new"));
  if (newest) {
    tagged.set(`new-${newest.id}`, { ...newest, trendingBadge: "new" });
  }

  return Array.from(tagged.values()).slice(0, 6);
}

function mapRecommendations(data: ActionCenterData, all: ContestListing[]): ContestListing[] {
  return data.recommendations
    .map((rec) => {
      const match = all.find((c) => rec.playUrl.startsWith(c.href) || c.href === rec.playUrl);
      if (match) return { ...match, subtitle: rec.detail, trendingBadge: "featured" as TrendingBadge };
      return null;
    })
    .filter(Boolean) as ContestListing[];
}

export function buildContestCenterViewModel(input: {
  action: ActionCenterData;
  friends?: GameDayFriendActivity[];
}): ContestCenterViewModel {
  const sportStats = new Map(
    input.action.upcomingSports.map((s) => [s.sport.toLowerCase(), s])
  );

  const templates = CONTEST_TEMPLATES.map((template) => {
    const stat = sportStats.get(template.sportKey);
    return templateToListing(template, {
      playersJoined: stat?.playersWaiting,
      remainingSpots: stat?.squaresRemaining,
      prizePoolLabel: stat ? `${stat.boardsOpen} boards open` : undefined,
      gameTimeLabel: stat?.gamesToday ? `${stat.gamesToday} games today` : undefined,
    });
  });

  const boardContests = buildBoardContests(input.action);
  const allContests = [...boardContests, ...templates];
  const featured = pickFeatured(templates, boardContests, input.action);
  const featuredId = featured?.id;

  const liveContests = allContests
    .filter((c) => c.status !== "coming_soon" && c.id !== featuredId)
    .sort((a, b) => {
      const order: Record<ContestStatus, number> = {
        live: 0,
        almost_full: 1,
        filling: 2,
        open: 3,
        locked: 4,
        completed: 5,
        coming_soon: 6,
      };
      return order[a.status] - order[b.status];
    });

  const trendingContests = buildTrending(templates, boardContests);
  const recommendations = mapRecommendations(input.action, allContests);

  const friendsActivity: ContestFriendActivity[] = (input.friends ?? []).map((f) => ({
    id: f.id,
    emoji: f.emoji,
    name: f.name,
    action: f.action,
    href: f.href,
  }));

  return {
    featured,
    liveContests,
    trendingContests,
    friendsActivity,
    recommendations,
    quickJoin: null,
    updatedAt: input.action.updatedAt,
    hasContests: liveContests.length > 0 || templates.some((t) => t.status !== "coming_soon"),
  };
}

export function rememberContestJoin(contestId: string): void {
  try {
    localStorage.setItem(LAST_CONTEST_KEY, contestId);
  } catch {
    /* ignore */
  }
}

export function contestMatchesFilter(contest: ContestListing, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "trending") return Boolean(contest.trendingBadge);
  if (filter === "new") {
    return contest.trendingBadge === "new" || (contest.filterTags?.includes("new") ?? false);
  }
  if (filter === "pickem") return contest.kind === "pickem";
  if (filter === "survivor") return contest.kind === "survivor";
  if (filter === "tournament") return contest.kind === "tournament";
  if (filter === "private") return contest.kind === "private";
  if (filter === "favorites") return contest.filterTags?.includes("favorites") ?? false;
  return contest.sportKey === filter || contest.kind === filter;
}

export function contestMatchesSearch(contest: ContestListing, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    contest.title,
    contest.subtitle ?? "",
    contest.sport,
    contest.contestType,
    contest.id,
    ...contest.searchTerms,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
