import { EMPTY_STATE } from "@/lib/platform/language/emptyStateLanguage";
import { CONTEST_CTAS } from "@/lib/platform/language/contestLanguage";
import { ALIVE_COPY } from "@/lib/platform/language/aliveLanguage";
import type { AliveEmptyStatePayload, AliveEmptyStateStep } from "./types";

export type AliveEmptyContext =
  | "contest_center"
  | "wallet_zero"
  | "no_games"
  | "no_notifications"
  | "no_rewards"
  | "no_leaderboard"
  | "no_friends"
  | "no_contest_history"
  | "no_rewards_history"
  | "no_profile_activity"
  | "no_followers"
  | "no_activity_center"
  | "generic";

const CONTEXT_STEPS: Record<AliveEmptyContext, AliveEmptyStateStep[]> = {
  contest_center: [
    {
      id: "notifications",
      title: "Enable notifications",
      body: "Never miss kickoff — get alerted when new contests open.",
      ctaLabel: "Notifications",
      ctaHref: "/my-games/notifications",
      emoji: "🔔",
    },
    {
      id: "join",
      title: "Pick a contest and join",
      body: "Your Legacy™ starts with your first board.",
      ctaLabel: CONTEST_CTAS.joinTheContest,
      ctaHref: "/games/nfl",
      emoji: "🏆",
    },
    {
      id: "daily",
      title: "Check Daily Story",
      body: "Today's featured matchups and momentum picks.",
      ctaLabel: "Daily Story",
      ctaHref: "/game-day",
      emoji: "📰",
    },
  ],
  wallet_zero: [
    {
      id: "deposit",
      title: "Fund SquareWallet™",
      body: "One deposit unlocks every contest on the platform.",
      ctaLabel: "Add Funds",
      ctaHref: "/my-games/wallet?tab=deposit",
      emoji: "💳",
    },
    {
      id: "browse",
      title: "Browse free-entry contests",
      body: "Some promotions let you compete with bonus credits.",
      ctaLabel: CONTEST_CTAS.browseContests,
      ctaHref: "/contest-center",
      emoji: "🎁",
    },
  ],
  no_games: [
    {
      id: "browse",
      title: "Join your first contest",
      body: "Live boards are waiting — every competition builds your legacy.",
      ctaLabel: CONTEST_CTAS.browseContests,
      ctaHref: "/contest-center",
      emoji: "🏈",
    },
    {
      id: "contest_center",
      title: "Visit Contest Center",
      body: "See everything live today across NFL, MLB, Pick'em, and more.",
      ctaLabel: "Contest Center",
      ctaHref: "/contest-center",
      emoji: "📋",
    },
  ],
  no_notifications: [
    {
      id: "contests",
      title: "Browse live contests",
      body: "Join a board — game-day alerts appear here automatically.",
      ctaLabel: CONTEST_CTAS.browseLiveContests,
      ctaHref: "/contest-center",
      emoji: "🔔",
    },
  ],
  no_rewards: [
    {
      id: "drop",
      title: "Open Weekly Reward Drop",
      body: "Compete this week to qualify for your next drop.",
      ctaLabel: "Rewards",
      ctaHref: "/my-games/rewards",
      emoji: "🎁",
    },
    {
      id: "contest",
      title: "Join a contest",
      body: "Every competition earns XP and tier credits.",
      ctaLabel: CONTEST_CTAS.joinTheContest,
      ctaHref: "/contest-center",
      emoji: "🏆",
    },
  ],
  no_leaderboard: [
    {
      id: "join",
      title: "Be first on the board",
      body: "Join a live contest — rankings update as you compete.",
      ctaLabel: CONTEST_CTAS.joinTheContest,
      ctaHref: "/games/nfl",
      emoji: "🏆",
    },
    {
      id: "contest_center",
      title: "Browse Contest Center",
      body: "See everything live today across NFL, MLB, Pick'em, and more.",
      ctaLabel: "Contest Center",
      ctaHref: "/contest-center",
      emoji: "📋",
    },
  ],
  no_friends: [
    {
      id: "huddle",
      title: "Find competitors in The Huddle",
      body: "Follow players you respect — see who joins contests live.",
      ctaLabel: "The Huddle",
      ctaHref: "/huddle",
      emoji: "💬",
    },
    {
      id: "invite",
      title: "Invite your crew",
      body: "Share SquareBoards — grow your community and earn referral rewards.",
      ctaLabel: "Referrals",
      ctaHref: "/my-games/referrals",
      emoji: "👥",
    },
  ],
  no_contest_history: [
    {
      id: "browse",
      title: "Join your first contest",
      body: "Every win and payout builds your competition timeline.",
      ctaLabel: CONTEST_CTAS.browseContests,
      ctaHref: "/contest-center",
      emoji: "🏈",
    },
    {
      id: "daily",
      title: "Check Daily Story",
      body: "Today's featured matchups and momentum picks.",
      ctaLabel: "Daily Story",
      ctaHref: "/game-day",
      emoji: "📰",
    },
  ],
  no_rewards_history: [
    {
      id: "drop",
      title: "Claim your Weekly Drop",
      body: "Compete this week to unlock tier credits and bonus rewards.",
      ctaLabel: "Square Drop",
      ctaHref: "/my-games/rewards/square-drop",
      emoji: "🎁",
    },
    {
      id: "achievements",
      title: "View achievements",
      body: "Track milestones as you compete across the platform.",
      ctaLabel: "Achievements",
      ctaHref: "/my-games/rewards/achievements",
      emoji: "⭐",
    },
  ],
  no_profile_activity: [
    {
      id: "join",
      title: "Join your first contest",
      body: "Your competition history will begin after your first contest.",
      ctaLabel: CONTEST_CTAS.joinTheContest,
      ctaHref: "/contest-center",
      emoji: "🏆",
    },
    {
      id: "leaderboards",
      title: "See the competition",
      body: "Browse global rankings and find competitors to follow.",
      ctaLabel: "Rankings",
      ctaHref: "/leaderboards",
      emoji: "🏅",
    },
  ],
  no_followers: [
    {
      id: "compete",
      title: "Compete and build reputation",
      body: "As you compete and build your reputation, other players can follow your journey.",
      ctaLabel: CONTEST_CTAS.joinTheContest,
      ctaHref: "/games/nfl",
      emoji: "🏆",
    },
    {
      id: "huddle",
      title: "Share in The Huddle",
      body: "Publish pick cards and wins to grow your following.",
      ctaLabel: "The Huddle",
      ctaHref: "/huddle",
      emoji: "👥",
    },
  ],
  no_activity_center: [
    {
      id: "join",
      title: "Join your first contest",
      body: "Wins, deposits, and milestones appear here as you compete.",
      ctaLabel: CONTEST_CTAS.joinTheContest,
      ctaHref: "/contest-center",
      emoji: "🏆",
    },
    {
      id: "notifications",
      title: "Enable notifications",
      body: "Get alerted when contests open and you win.",
      ctaLabel: "Notifications",
      ctaHref: "/my-games/notifications",
      emoji: "🔔",
    },
  ],
  generic: [
    {
      id: "browse",
      title: "Browse live contests",
      body: "NFL, MLB, Pick'em, and more — something is always filling.",
      ctaLabel: CONTEST_CTAS.browseLiveContests,
      ctaHref: "/contest-center",
      emoji: "🏆",
    },
    {
      id: "daily",
      title: "Check Daily Story",
      body: "Today's featured matchups and momentum picks.",
      ctaLabel: "Daily Story",
      ctaHref: "/game-day",
      emoji: "📰",
    },
    {
      id: "community",
      title: "Join The Huddle™",
      body: "See what competitors are talking about right now.",
      ctaLabel: "Community",
      ctaHref: "/huddle",
      emoji: "💬",
    },
  ],
};

const CONTEXT_COPY: Record<AliveEmptyContext, { title: string; body: string }> = {
  contest_center: {
    title: EMPTY_STATE.noContests.title,
    body: EMPTY_STATE.noContests.body,
  },
  wallet_zero: {
    title: "No funds yet",
    body: "Add funds securely to join your first contest.",
  },
  no_games: {
    title: EMPTY_STATE.noGamesAvailable.title,
    body: EMPTY_STATE.noGamesAvailable.body,
  },
  no_notifications: {
    title: "You're all caught up",
    body: "We'll notify you when something important happens.",
  },
  no_rewards: {
    title: "Your rewards journey starts here",
    body: "Join your first contest to begin earning achievements and unlocking new rewards.",
  },
  no_leaderboard: {
    title: EMPTY_STATE.noRankings.title,
    body: EMPTY_STATE.noRankings.body,
  },
  no_friends: {
    title: "Your crew hasn't checked in yet",
    body: "Follow competitors in The Huddle to see who joins contests live.",
  },
  no_contest_history: {
    title: "Your competition timeline starts here",
    body: "Your contests will appear here after you join your first board.",
  },
  no_rewards_history: {
    title: "No reward activity yet",
    body: "Compete in contests and open your Weekly Reward Drop to start earning.",
  },
  no_profile_activity: {
    title: "Your competition timeline starts here",
    body: "Your competition history will begin after your first contest.",
  },
  no_followers: {
    title: "No followers yet",
    body: "As you compete and build your reputation, other players can follow your journey.",
  },
  no_activity_center: {
    title: "Your activity timeline will grow as you compete",
    body: "Your activity timeline will grow as you compete and interact on SquareBoards.",
  },
  generic: {
    title: ALIVE_COPY.emptyStateHeading,
    body: ALIVE_COPY.emptyStateBody,
  },
};

export function buildEmptyStateIntelligence(
  context: AliveEmptyContext,
  overrides?: Partial<Pick<AliveEmptyStatePayload, "title" | "body">>
): AliveEmptyStatePayload {
  const copy = CONTEXT_COPY[context];
  return {
    title: overrides?.title ?? copy.title,
    body: overrides?.body ?? copy.body,
    steps: CONTEXT_STEPS[context],
    context,
  };
}
