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

const ZERO_BALANCE: BalanceResponse = {
  ready: true,
  availableCents: 0,
  formattedAvailable: "$0.00",
};

function formatBalanceCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function resolveDisplayAmount(balance: BalanceResponse | null): string {
  if (balance?.formattedAvailable) return balance.formattedAvailable;
  if (balance && Number.isFinite(balance.availableCents)) {
    return formatBalanceCents(balance.availableCents);
  }
  return ZERO_BALANCE.formattedAvailable!;
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
        const data = (await res.json()) as BalanceResponse;
        setBalance({
          ready: true,
          availableCents: data.availableCents ?? 0,
          formattedAvailable:
            data.formattedAvailable ?? formatBalanceCents(data.availableCents ?? 0),
        });
        return;
      }
      setBalance(ZERO_BALANCE);
    } catch {
      setBalance(ZERO_BALANCE);
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

  if (!loading && !balance) {
    return null;
  }

  const displayAmount = resolveDisplayAmount(balance);

  return (
    <Link
      href="/my-games/wallet"
      className={[
        "wallet-balance-chip",
        loading ? "wallet-balance-chip-loading" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`SquareWallet available balance ${displayAmount}`}
      title="SquareWallet™ — view account"
    >
      <Wallet className="w-4 h-4 shrink-0 text-sb-gold" strokeWidth={1.75} aria-hidden />
      <span
        className={[
          "wallet-balance-chip-amount tabular-nums",
          loading ? "wallet-balance-chip-amount-loading" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {displayAmount}
      </span>
    </Link>
  );
}
