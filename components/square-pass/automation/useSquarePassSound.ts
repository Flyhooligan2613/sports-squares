"use client";

/** Placeholder sound hook — wire to audio assets when available. */
export function useSquarePassSound() {
  return {
    playCelebration: () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("square-pass-sound", { detail: { type: "celebration" } }));
      }
    },
    playReveal: () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("square-pass-sound", { detail: { type: "reveal" } }));
      }
    },
  };
}
