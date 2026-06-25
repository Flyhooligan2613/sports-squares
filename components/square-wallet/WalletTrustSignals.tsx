"use client";

import { Lock, ShieldCheck, Sparkles } from "lucide-react";
import { WALLET_COPY } from "@/lib/platform/language/walletLanguage";

const SIGNALS = [
  { icon: Lock, label: WALLET_COPY.trust.encrypted },
  { icon: ShieldCheck, label: WALLET_COPY.trust.securePayments },
  { icon: Sparkles, label: WALLET_COPY.trust.trustedPartners },
] as const;

export default function WalletTrustSignals({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-sb-muted/80",
        className,
      ].join(" ")}
      role="contentinfo"
      aria-label="SquareWallet security assurances"
    >
      {SIGNALS.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-sb-gold/70 shrink-0" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
