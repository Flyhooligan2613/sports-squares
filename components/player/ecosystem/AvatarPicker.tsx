"use client";

import { useState } from "react";
import { PLAYER_AVATARS } from "@/lib/platform/ecosystem/avatars";

export default function AvatarPicker({
  current,
  onChanged,
}: {
  current?: string;
  onChanged?: (emoji: string) => void;
}) {
  const [selected, setSelected] = useState(current ?? "🎮");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(emoji: string) {
    setSelected(emoji);
    setBusy(true);
    setSaved(false);
    const res = await fetch("/api/ecosystem/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emoji }),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      onChanged?.(emoji);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-white mb-2">Choose your avatar</p>
      <p className="text-xs text-sb-muted mb-3">
        Shown on leaderboards, profile, referrals, and live feed.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {PLAYER_AVATARS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={busy}
            onClick={() => void save(emoji)}
            className={[
              "w-11 h-11 rounded-xl text-xl flex items-center justify-center border transition-all",
              selected === emoji
                ? "border-sb-purple bg-sb-purple/20 scale-110"
                : "border-white/10 bg-white/[0.03] hover:border-white/25",
            ].join(" ")}
            aria-label={`Avatar ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      {saved ? <p className="text-xs text-emerald-400">Avatar saved!</p> : null}
    </div>
  );
}
