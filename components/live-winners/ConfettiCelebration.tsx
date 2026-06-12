"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface ConfettiCelebrationProps {
  trigger: number;
  tier?: "medium" | "large";
}

export default function ConfettiCelebration({
  trigger,
  tier = "medium",
}: ConfettiCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [trigger]);

  if (!visible) return null;

  const count = tier === "large" ? 16 : 10;

  return (
    <div
      className={[
        "lwc-confetti-wrap",
        tier === "large" ? "lwc-confetti-wrap-large" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={`${trigger}-${index}`}
          className="lwc-confetti-particle"
          style={{ "--i": index } as CSSProperties}
        />
      ))}
    </div>
  );
}
