export interface ComboState {
  streak: number;
  multiplier: number;
  label: string | null;
}

export function resolveComboMultiplier(streak: number): ComboState {
  if (streak >= 16) {
    return { streak, multiplier: 8, label: "Legendary Combo" };
  }
  if (streak >= 7) {
    return { streak, multiplier: 5, label: "Combo x5" };
  }
  if (streak >= 3) {
    return { streak, multiplier: 2, label: "Combo x2" };
  }
  return { streak, multiplier: 1, label: null };
}

export function bracketPointsForRound(roundNumber: number): number {
  return Math.pow(2, Math.max(0, 6 - roundNumber));
}
