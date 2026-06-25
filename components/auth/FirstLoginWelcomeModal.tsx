"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { markFirstLoginWelcomeSeen } from "@/lib/auth/firstLoginWelcome";

const ACTION_CARDS = [
  {
    id: "verify",
    emoji: "🪪",
    title: "Verify identity",
    body: "Connect your cash-out profile so winnings reach you automatically.",
    href: "/my-games/profile#payout",
    cta: "Set up cash-out",
  },
  {
    id: "funds",
    emoji: "💳",
    title: "Add funds",
    body: "Fund SquareWallet once — join any contest on the platform.",
    href: "/my-games/wallet?tab=deposit",
    cta: "Add funds",
  },
  {
    id: "contest",
    emoji: "🏆",
    title: "Join first contest",
    body: "Pick a live board and lock in your squares before kickoff.",
    href: "/contest-center",
    cta: "Browse contests",
  },
  {
    id: "rewards",
    emoji: "🎁",
    title: "Explore rewards",
    body: "Tier credits, weekly drops, and achievements build your legacy.",
    href: "/my-games/rewards",
    cta: "View rewards",
  },
] as const;

interface FirstLoginWelcomeModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
}

export default function FirstLoginWelcomeModal({ open, email, onClose }: FirstLoginWelcomeModalProps) {
  if (!open) return null;

  function handleDismiss() {
    if (email) markFirstLoginWelcomeSeen(email);
    onClose();
  }

  return (
    <div
      className="signup-welcome-overlay first-login-welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-login-welcome-title"
    >
      <div className="signup-welcome-modal first-login-welcome-modal sb-promo-scale-in">
        <button
          type="button"
          className="sb-promo-close"
          aria-label="Close welcome"
          onClick={handleDismiss}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="signup-welcome-header">
          <p className="signup-welcome-kicker">Welcome to SquareBoards</p>
          <h2 id="first-login-welcome-title" className="signup-welcome-title">
            Your account is ready.
          </h2>
          <p className="signup-welcome-subtitle">
            Here&apos;s how to get into your first contest — each step takes just a minute.
          </p>
        </div>

        <div className="signup-welcome-body first-login-welcome-body">
          <div className="first-login-welcome-grid">
            {ACTION_CARDS.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                onClick={handleDismiss}
                className="first-login-welcome-card"
              >
                <span className="text-2xl mb-2 block" aria-hidden>
                  {card.emoji}
                </span>
                <p className="text-sm font-semibold text-white mb-1">{card.title}</p>
                <p className="text-xs text-sb-muted leading-relaxed mb-2">{card.body}</p>
                <span className="text-xs font-semibold text-sb-glow">{card.cta} →</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="signup-welcome-footer">
          <Button type="button" variant="ghost" onClick={handleDismiss}>
            Explore on my own
          </Button>
          <Button
            type="button"
            className="player-btn-glow"
            href="/contest-center"
            onClick={handleDismiss}
          >
            Join first contest
          </Button>
        </div>
      </div>
    </div>
  );
}
