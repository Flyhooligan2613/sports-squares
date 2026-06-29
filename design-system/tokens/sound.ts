/** Sound token map — keys for platform audio events. Wire to live-arena or global audio service. */
export const soundTokens = {
  button: "sqds-sound-button",
  notification: "sqds-sound-notification",
  wallet: "sqds-sound-wallet",
  winning: "sqds-sound-winning",
  touchdown: "sqds-sound-touchdown",
  quarterEnd: "sqds-sound-quarter-end",
  achievement: "sqds-sound-achievement",
  contestComplete: "sqds-sound-contest-complete",
} as const;

export type SoundToken = keyof typeof soundTokens;

export const sound = soundTokens;
