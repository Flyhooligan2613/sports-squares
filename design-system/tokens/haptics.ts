/** Haptic feedback token map — keys for Capacitor / Web Vibration API. */
export const hapticTokens = {
  light: "sqds-haptic-light",
  medium: "sqds-haptic-medium",
  heavy: "sqds-haptic-heavy",
  walletReward: "sqds-haptic-wallet-reward",
  winningSquare: "sqds-haptic-winning-square",
  touchdown: "sqds-haptic-touchdown",
  contestJoined: "sqds-haptic-contest-joined",
} as const;

export type HapticToken = keyof typeof hapticTokens;

/** Vibration patterns in milliseconds [vibrate, pause, vibrate, …]. */
export const hapticPatterns: Record<HapticToken, number[]> = {
  light: [10],
  medium: [20],
  heavy: [40],
  walletReward: [15, 40, 15],
  winningSquare: [25, 50, 25, 50, 40],
  touchdown: [30, 20, 50],
  contestJoined: [12, 30, 12],
};

export const haptics = hapticTokens;
