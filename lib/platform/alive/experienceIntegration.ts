/**
 * ExperienceEngine™ integration stubs — AliveEngine™ celebration hooks.
 * Wire these when ExperienceEngine is fully implemented.
 */

import type { AliveCelebrationEvent } from "./types";

type CelebrationHandler = (event: AliveCelebrationEvent, metadata?: Record<string, unknown>) => void;

const handlers = new Set<CelebrationHandler>();

export const AliveExperienceBridge = {
  /** Register a handler for milestone celebrations (e.g. confetti, modals). */
  onCelebration(handler: CelebrationHandler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  },

  /** Trigger a celebration event from wallet, genesis, or progression flows. */
  emitCelebration(event: AliveCelebrationEvent, metadata?: Record<string, unknown>): void {
    handlers.forEach((handler) => {
      try {
        handler(event, metadata);
      } catch (err) {
        console.warn("[AliveExperienceBridge]", event, err);
      }
    });
  },

  /** Integration points — call from deposit success, first contest, level up, etc. */
  hooks: {
    onFirstDeposit: (amountCents: number) =>
      AliveExperienceBridge.emitCelebration("first_deposit", { amountCents }),
    onFirstContest: (contestId: string) =>
      AliveExperienceBridge.emitCelebration("first_contest", { contestId }),
    onLevelUp: (tierLevel: number) =>
      AliveExperienceBridge.emitCelebration("level_up", { tierLevel }),
    onAchievementUnlock: (achievementId: string) =>
      AliveExperienceBridge.emitCelebration("achievement_unlock", { achievementId }),
    onStreakMilestone: (streakDays: number) =>
      AliveExperienceBridge.emitCelebration("streak_milestone", { streakDays }),
    onWalletWin: (amountCents: number) =>
      AliveExperienceBridge.emitCelebration("wallet_win", { amountCents }),
  },
};
