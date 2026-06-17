"use client";

import { PLAYER_AVATARS } from "@/lib/platform/ecosystem/avatars";

interface AvatarEmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  disabled?: boolean;
  compact?: boolean;
  options?: readonly string[];
  premiumEmojis?: string[];
}

export default function AvatarEmojiPicker({
  value,
  onChange,
  disabled = false,
  compact = false,
  options = PLAYER_AVATARS,
  premiumEmojis = [],
}: AvatarEmojiPickerProps) {
  const premiumSet = new Set(premiumEmojis);

  return (
    <div
      className={[
        "signup-avatar-grid",
        compact ? "signup-avatar-grid-compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="listbox"
      aria-label="Choose profile emoji"
    >
      {options.map((emoji) => {
        const selected = value === emoji;
        const isPremium = premiumSet.has(emoji);
        return (
          <button
            key={emoji}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={isPremium ? `Premium avatar ${emoji}` : `Avatar ${emoji}`}
            disabled={disabled}
            onClick={() => onChange(emoji)}
            className={[
              "signup-avatar-option",
              selected ? "signup-avatar-option-selected" : "",
              isPremium ? "signup-avatar-option-premium" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span aria-hidden>{emoji}</span>
            {isPremium ? (
              <span className="signup-avatar-premium-badge" aria-hidden>
                ✦
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
