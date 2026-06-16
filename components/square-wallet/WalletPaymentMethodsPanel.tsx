"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PlayerPayoutSetup from "@/components/player/PlayerPayoutSetup";
import type { SquareWalletDashboard } from "@/lib/platform/engines/payment/wallet";

interface WalletPaymentMethodsPanelProps {
  paymentMethod: SquareWalletDashboard["paymentMethod"];
}

export default function WalletPaymentMethodsPanel({
  paymentMethod,
}: WalletPaymentMethodsPanelProps) {
  return (
    <div className="space-y-6">
      <LandingGlassCard glow className="p-6">
        <p className="text-xs uppercase tracking-wider text-sb-gold/90 mb-2">Deposit method</p>
        <h3 className="text-lg font-bold text-white mb-2">Debit card for SquareWallet™</h3>
        {paymentMethod.fastCheckoutAvailable && paymentMethod.last4 ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-white">
                {paymentMethod.brand ?? "Card"} ···· {paymentMethod.last4}
              </p>
              <p className="text-xs text-sb-muted mt-1">
                Used for fast deposits. Card details are stored securely through SquareWallet™ —
                never on SquareBoards servers.
              </p>
            </div>
            <p className="text-xs text-emerald-300/90 font-medium">Connected</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-sb-muted leading-relaxed max-w-xl">
              No debit card on file yet. Add funds from the Deposit tab — SquareWallet™ will save
              your card for faster checkout next time.
            </p>
          </div>
        )}
      </LandingGlassCard>

      <PlayerPayoutSetup showWhenReady connectEnabled />
    </div>
  );
}
