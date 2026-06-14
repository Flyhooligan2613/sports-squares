"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cashOutSetupUrl } from "@/lib/auth/cashOutPrompt";

interface CashOutSetupModalProps {
  open: boolean;
  urgent?: boolean;
  onClose: () => void;
  onDismissLater: () => void;
}

export default function CashOutSetupModal({
  open,
  urgent = false,
  onClose,
  onDismissLater,
}: CashOutSetupModalProps) {
  if (!open) return null;

  function handleSetupNow() {
    onClose();
    window.location.href = cashOutSetupUrl(true);
  }

  return (
    <div
      className="signup-welcome-overlay cashout-setup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cashout-setup-title"
    >
      <div className="signup-welcome-modal cashout-setup-modal sb-promo-scale-in">
        <div className="signup-welcome-header">
          <p className="signup-welcome-kicker">One quick step to play</p>
          <h2 id="cashout-setup-title" className="signup-welcome-title">
            Set up your cash-out account
          </h2>
          <p className="signup-welcome-subtitle">
            SquareBoards uses Stripe to verify your identity, link payouts, and process square
            purchases securely. It takes about 2 minutes and is required before you can buy
            squares or enter contests.
          </p>
        </div>

        <div className="signup-welcome-body">
          <div className="cashout-setup-steps">
            <div className="cashout-setup-step">
              <span className="cashout-setup-step-num">1</span>
              <p>Tap <strong>Set up cash-out now</strong> — Stripe opens in a secure window.</p>
            </div>
            <div className="cashout-setup-step">
              <span className="cashout-setup-step-num">2</span>
              <p>Confirm your identity and payout details with Stripe.</p>
            </div>
            <div className="cashout-setup-step">
              <span className="cashout-setup-step-num">3</span>
              <p>Return here and browse boards — you&apos;re ready to play and win.</p>
            </div>
          </div>

          <div className="cashout-setup-note">
            <Wallet className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden />
            <p>
              SquareBoards does not hold your money. Stripe handles deposits, fraud checks, and
              automatic winnings payouts.
            </p>
          </div>
        </div>

        <div className="signup-welcome-footer cashout-setup-footer">
          <Button type="button" variant="ghost" onClick={onDismissLater}>
            {urgent ? "I'll do this in a minute" : "Remind me later"}
          </Button>
          <Button type="button" className="player-btn-glow" onClick={handleSetupNow}>
            Set up cash-out now
          </Button>
        </div>
      </div>
    </div>
  );
}
