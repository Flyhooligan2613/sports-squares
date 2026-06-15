/** RewardCore tier credit amounts for Survivor X™ — not purchasable, participation-based. */
export const SURVIVOR_REWARD_CREDITS = {
  weekSurvived: 5,
  shieldSavedBonus: 10,
  lifeLostConsolation: 8,
  eliminatedConsolation: 15,
  champion: 100,
} as const;

export function survivorRewardSource(
  kind: keyof typeof SURVIVOR_REWARD_CREDITS,
  idempotencyKey: string
): string {
  return `survivor_${kind}:${idempotencyKey}`;
}
