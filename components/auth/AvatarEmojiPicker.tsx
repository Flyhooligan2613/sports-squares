"use client";

import { PLAYER_AVATARS } from "@/lib/platform/ecosystem/avatars";

interface AvatarEmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function AvatarEmojiPicker({
  value,
  onChange,
  disabled = false,
  compact = false,
}: AvatarEmojiPickerProps) {
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
      {PLAYER_AVATARS.map((emoji) => {
        const selected = value === emoji;
        return (
          <button
            key={emoji}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={disabled}
            onClick={() => onChange(emoji)}
            className={[
              "signup-avatar-option",
              selected ? "signup-avatar-option-selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span aria-hidden>{emoji}</span>
          </button>
        );
      })}
    </div>
  );
}
