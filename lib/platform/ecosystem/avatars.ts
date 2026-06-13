export const PLAYER_AVATARS = [
  "😀", "😎", "🤠", "👑", "🐐", "🔥", "⚡", "🎯",
  "🎮", "🏆", "🏈", "⚾", "🏀", "⚽", "🍀", "🚀", "💎", "🎲",
] as const;

export type PlayerAvatarEmoji = (typeof PLAYER_AVATARS)[number];

export function isValidAvatar(emoji: string): emoji is PlayerAvatarEmoji {
  return (PLAYER_AVATARS as readonly string[]).includes(emoji);
}

export const DEFAULT_AVATAR: PlayerAvatarEmoji = "🎮";
