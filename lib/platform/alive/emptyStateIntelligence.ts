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
  | "generic";

const CONTEXT_STEPS: Record<AliveEmptyContext, AliveEmptyStateStep[]> = {
  contest_center: [
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
    {
      id: "huddle",
      title: "Join The Huddle™",
      body: "See what competitors are discussing right now.",
      ctaLabel: "Community",
      ctaHref: "/huddle",
      emoji: "💬",
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
    title: "Fund your SquareWallet™",
    body: "Add funds once — join every contest from your premium wallet hub.",
  },
  no_games: {
    title: EMPTY_STATE.noGamesAvailable.title,
    body: EMPTY_STATE.noGamesAvailable.body,
  },
  no_notifications: {
    title: "You're all caught up",
    body: "Wins, payouts, and game-day alerts land here first.",
  },
  no_rewards: {
    title: EMPTY_STATE.noRewards.title,
    body: EMPTY_STATE.noRewards.body,
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
