/**
 * Notification copy templates — competition-oriented, never sportsbook tone.
 * Platform Polish Sprint #002 — Contest Language Engine™
 */

export const NOTIFICATION_TEMPLATES = {
  contestOpening: "A new contest is open for competition.",
  contestAlmostFull: "Only a few spots remain — lock in your contest.",
  contestLocked: "Contest locked. Competition starts soon.",
  contestLive: "Competition in progress — follow the action live.",
  contestComplete: "Contest complete. Check your results and legacy.",
  achievementUnlocked: "Achievement unlocked — claim your reward.",
  referralEarned: "Referral reward earned — thank you for growing the community.",
  tierPromotion: "Tier promotion — your reputation is rising.",
  championshipWon: "Champion crowned — your legacy is permanent.",
  leaderboardPromotion: "You moved up the competition rankings.",
  rewardDropReady: "Your Weekly Reward Drop is ready to open.",
  friendJoinedContest: "A friend joined a contest — compete together.",
  picksDue: "Lock in your picks before the contest closes.",
  survivorAdvance: "You advanced — keep your streak alive.",
  survivorEliminated: "This week's run ended — new contests await.",
  pickemWeekOpen: "Pick'em week is open for competition.",
  poolAlmostFull: "Only a few spots remain — lock in your contest.",
  poolAtCapacity: "Contest pool at capacity — competition locked in.",
  pickemSundayComplete: "Sunday slate complete — your competition continues.",
  mondayPredictionDue: "Lock in your Monday prediction before kickoff.",
  predictionLocked: "Predictions locked — standings finalize automatically.",
  pickemPoolChampion: "Champion crowned in your Pick'em pool.",
  pickemChampionSplit: "Championship tie — prize split between champions.",
  pickemPayoutSent: "Contest winnings sent to your account.",
  pickemWinStreak: "Win streak active — keep your momentum going.",
  pickemPerfectWeek: "Perfect week — flawless picks.",
} as const;

export type NotificationTemplateKey = keyof typeof NOTIFICATION_TEMPLATES;

/** Resolve a notification title with optional interpolation. */
export function notificationCopy(
  key: NotificationTemplateKey,
  vars?: Record<string, string>
): string {
  let text: string = NOTIFICATION_TEMPLATES[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}
