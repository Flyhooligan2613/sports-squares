"use client";

interface PlayerAvatarProps {
  emoji?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-xl",
  lg: "w-14 h-14 text-3xl",
} as const;

export default function PlayerAvatar({
  emoji,
  size = "md",
  className = "",
}: PlayerAvatarProps) {
  return (
    <span
      className={[
        "player-avatar player-avatar-emoji shrink-0",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {emoji?.trim() || "🎮"}
    </span>
  );
}
