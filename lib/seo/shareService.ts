/**
 * SquareBoards Share Service — public exports for share sheets and integrations.
 */
export { shareUrls } from "@/lib/seo/shareUrls";
export { buildShareMetadata } from "@/lib/seo/og/metadata";
export type {
  ProfileShareData,
  ContestShareData,
  WinnerShareData,
  LevelUpShareData,
  AchievementShareData,
  TrophyShareData,
  ReferralShareData,
  LeaderboardShareData,
  StoryShareData,
  SeasonShareData,
} from "@/lib/seo/og/types";
export {
  fetchProfileShareData,
  fetchContestShareData,
  fetchWinnerShareData,
  fetchLevelUpShareData,
  fetchAchievementShareData,
  fetchTrophyShareData,
  fetchReferralShareData,
  fetchLeaderboardShareData,
  fetchStoryShareData,
  fetchSeasonShareData,
} from "@/lib/seo/og/data";
