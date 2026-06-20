/** Canonical share URLs for SquareBoards — use when invoking native share sheets. */
export const shareUrls = {
  profile: (username: string) => `/profile/${encodeURIComponent(username)}`,
  contest: (id: string) => `/share/contest/${encodeURIComponent(id)}`,
  winner: (username: string, winId: string) =>
    `/share/winner/${encodeURIComponent(username)}/${encodeURIComponent(winId)}`,
  levelUp: (username: string, tierSlug: string) =>
    `/share/level-up/${encodeURIComponent(username)}/${encodeURIComponent(tierSlug)}`,
  achievement: (username: string, achievementId: string) =>
    `/share/achievement/${encodeURIComponent(username)}/${encodeURIComponent(achievementId)}`,
  trophy: (username: string, trophyId: string) =>
    `/share/trophy/${encodeURIComponent(username)}/${encodeURIComponent(trophyId)}`,
  referral: (code: string) => `/share/referral/${encodeURIComponent(code)}`,
  leaderboard: (period: "weekly" | "monthly" | "all-time") =>
    `/share/leaderboard/${encodeURIComponent(period)}`,
  story: (username: string, storyId: string) =>
    `/share/story/${encodeURIComponent(username)}/${encodeURIComponent(storyId)}`,
  season: (username: string, seasonKey: string) =>
    `/share/season/${encodeURIComponent(username)}/${encodeURIComponent(seasonKey)}`,
} as const;
