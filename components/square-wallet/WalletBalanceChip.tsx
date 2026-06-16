"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";

interface BalanceResponse {
  ready: boolean;
  availableCents: number;
  formattedAvailable: string | null;
}

interface WalletBalanceChipProps {
  className?: string;
}

export default function WalletBalanceChip({ className = "" }: WalletBalanceChipProps) {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/square-wallet/balance", { cache: "no-store" });
      if (res.status === 401) {
        setBalance(null);
        return;
      }
      if (res.ok) {
        setBalance((await res.json()) as BalanceResponse);
      }
    } catch {
      setBalance({ ready: false, availableCents: 0, formattedAvailable: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  if (loading) {
    return (
      <span
        className={["wallet-balance-chip wallet-balance-chip-loading", className]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        <span className="wallet-balance-chip-skeleton" />
      </span>
    );
  }

  if (!balance?.ready || !balance.formattedAvailable) {
    return (
      <Link
        href="/my-games/wallet"
        className={["wallet-balance-chip wallet-balance-chip-fallback", className]
          .filter(Boolean)
          .join(" ")}
        aria-label="Open SquareWallet"
        title="SquareWallet™"
      >
        <Wallet className="w-4 h-4 shrink-0 text-sb-gold" strokeWidth={1.75} aria-hidden />
        <span className="hidden sm:inline text-xs font-semibold text-sb-muted">Wallet</span>
      </Link>
    );
  }

  return (
    <Link
      href="/my-games/wallet"
      className={["wallet-balance-chip", className].filter(Boolean).join(" ")}
      aria-label={`SquareWallet available balance ${balance.formattedAvailable}`}
      title="SquareWallet™ — view account"
    >
      <Wallet className="w-4 h-4 shrink-0 text-sb-gold" strokeWidth={1.75} aria-hidden />
      <span className="wallet-balance-chip-amount tabular-nums">{balance.formattedAvailable}</span>
    </Link>
  );
}
