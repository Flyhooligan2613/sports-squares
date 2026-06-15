import type { GameDayEmotionalNotification } from "@/lib/gameDay/types";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";

function emotionalCopyForType(
  type: PlayerNotification["type"],
  detail: string
): { emoji: string; title: string; body: string } {
  switch (type) {
    case "board_filled":
      return {
        emoji: "🔥",
        title: "Your board is filling fast",
        body: detail,
      };
    case "game_starting":
      return {
        emoji: "⏰",
        title: "Kickoff is almost here",
        body: detail,
      };
    case "quarter_winner":
      return {
        emoji: "🏆",
        title: "You just won a quarter",
        body: detail,
      };
    case "payment_sent":
      return {
        emoji: "💰",
        title: "Your payout is on the way",
        body: detail,
      };
    case "numbers_assigned":
      return {
        emoji: "🎲",
        title: "Your numbers are locked in",
        body: detail,
      };
    case "pickem_prediction_due":
      return {
        emoji: "🏈",
        title: "Your Pick'em card is still waiting",
        body: detail,
      };
    case "pickem_streak":
      return {
        emoji: "⚡",
        title: "Your streak is building",
        body: detail,
      };
    default:
      return {
        emoji: "✨",
        title: "Something good is happening",
        body: detail,
      };
  }
}

export function toEmotionalNotifications(
  notifications: PlayerNotification[]
): GameDayEmotionalNotification[] {
  return notifications.map((n) => {
    const copy = emotionalCopyForType(n.type, n.detail);
    return {
      id: n.id,
      emoji: copy.emoji,
      title: copy.title,
      body: copy.body,
      href: n.href,
      at: n.at,
    };
  });
}

export function buildSurvivorReminder(teamLabel?: string | null): GameDayEmotionalNotification {
  return {
    id: "survivor-reminder",
    emoji: "🛡️",
    title: "Your Survivor pick is still waiting",
    body: teamLabel
      ? `Lock in ${teamLabel} before kickoff to stay alive.`
      : "One pick keeps your season alive — choose before lock.",
    href: "/survivor",
    at: new Date().toISOString(),
  };
}

export function buildTierPushNotification(
  creditsToNext: number,
  nextTierLabel: string
): GameDayEmotionalNotification {
  return {
    id: "tier-push",
    emoji: "⭐",
    title: `You are ${creditsToNext} credits from ${nextTierLabel}`,
    body: "One more win could unlock your next tier milestone.",
    href: "/my-games/rewards/tier",
    at: new Date().toISOString(),
  };
}

export function buildRewardDropReady(): GameDayEmotionalNotification {
  return {
    id: "reward-drop-ready",
    emoji: "🎁",
    title: "Your Reward Drop is ready",
    body: "Open it now before the week rolls over.",
    href: "/my-games/rewards/square-drop",
    at: new Date().toISOString(),
  };
}
