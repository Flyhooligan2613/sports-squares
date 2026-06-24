"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/Button";

interface PlayerAccountSignupPromptProps {
  onClose: () => void;
  onDismiss: () => void;
}

const OVERLAY_SAFE_PADDING = {
  paddingTop: "max(1rem, var(--sb-safe-top))",
  paddingRight: "max(1rem, var(--sb-safe-right))",
  paddingBottom: "max(1rem, var(--sb-safe-bottom))",
  paddingLeft: "max(1rem, var(--sb-safe-left))",
} as const;

export default function PlayerAccountSignupPrompt({
  onClose,
  onDismiss,
}: PlayerAccountSignupPromptProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto overscroll-contain"
      style={OVERLAY_SAFE_PADDING}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-account-signup-title"
    >
      <div
        className="w-full max-w-md my-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <LandingGlassCard
          glow
          className="p-5 sm:p-6 relative max-h-[min(90dvh,calc(100dvh-var(--sb-safe-top)-var(--sb-safe-bottom)-2rem))] overflow-y-auto overscroll-contain"
        >
          <button
            type="button"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-sb-muted hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="text-center mb-4 sm:mb-5">
            <Logo variant="icon" href={false} className="mx-auto mb-3 sm:mb-4" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-purple-400/80 mb-2">
              Player Account
            </p>
            <h2
              id="player-account-signup-title"
              className="text-xl sm:text-2xl font-bold text-white mb-2"
            >
              Join the SquareBoards community
            </h2>
            <p className="text-sm text-sb-muted leading-relaxed">
              Create your free player profile to track wins, earn followers, unlock rewards,
              and share pick cards in The Huddle.
            </p>
          </div>

          <ul className="space-y-2 mb-4 sm:mb-5 text-sm text-sb-muted">
            <li className="flex items-center gap-2">
              <span className="text-purple-300">🏆</span>
              Public profile with win highlights
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-300">👥</span>
              Followers, tiers, and Square Drop rewards
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-300">🎮</span>
              One account for squares and pick&apos;em
            </li>
          </ul>

          <div className="flex flex-col gap-2">
            <Button href="/my-games/login?next=/" className="w-full player-btn-glow">
              Create free account
            </Button>
            <Button href="/my-games/login?next=/" variant="secondary" className="w-full">
              Sign in
            </Button>
            <button
              type="button"
              className="text-sm text-sb-muted hover:text-white transition-colors py-2"
              onClick={onDismiss}
            >
              Browse first
            </button>
          </div>

          <p className="text-[10px] text-center text-sb-muted mt-4">
            Already playing? Use the same email you bought squares with.
          </p>
        </LandingGlassCard>
      </div>
    </div>
  );
}
