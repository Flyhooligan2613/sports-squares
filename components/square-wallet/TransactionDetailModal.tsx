"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import type { SquareWalletLedgerEntry } from "@/lib/platform/engines/payment/wallet";
import { WALLET_COPY, WALLET_STATUS_LABELS } from "@/lib/platform/language/walletLanguage";
import {
  formatWalletCents,
  formatWalletDateTime,
  formatWalletType,
  resolvePaymentMethod,
  resolveReferenceId,
  resolveTransactionFee,
  resolveTransactionStatus,
  statusBadgeVariant,
} from "./walletTransactionUtils";

interface TransactionDetailModalProps {
  entry: SquareWalletLedgerEntry | null;
  onClose: () => void;
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.06] last:border-0">
      <span className="text-xs text-sb-muted shrink-0">{label}</span>
      <span className="text-sm text-white text-right font-medium tabular-nums break-all">{value}</span>
    </div>
  );
}

export default function TransactionDetailModal({ entry, onClose }: TransactionDetailModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!entry) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, onClose]);

  if (!entry) return null;

  const status = resolveTransactionStatus(entry);
  const feeCents = resolveTransactionFee(entry);
  const paymentMethod = resolvePaymentMethod(entry);
  const amountPrefix = entry.direction === "credit" ? "+" : "−";

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-receipt-title"
      onClick={onClose}
    >
      <LandingGlassCard
        glow
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 border border-white/10 animate-in slide-in-from-bottom-4 sm:fade-in sm:zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">SquareWallet™</p>
            <h2 id="wallet-receipt-title" className="text-lg font-bold text-white">
              {WALLET_COPY.receipt.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close receipt"
            className="p-2 -m-2 rounded-lg text-sb-muted hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-xs text-sb-muted mb-1">{formatWalletType(entry)}</p>
          <p
            className={`text-3xl font-bold tabular-nums ${
              entry.direction === "credit" ? "text-emerald-300" : "text-white"
            }`}
          >
            {amountPrefix}
            {formatWalletCents(entry.amountCents)}
          </p>
          <div className="mt-3 flex justify-center">
            <StatusBadge variant={statusBadgeVariant(status)} dot={status === "processing"}>
              {WALLET_STATUS_LABELS[status]}
            </StatusBadge>
          </div>
        </div>

        <div className="mb-6">
          <ReceiptRow label={WALLET_COPY.receipt.reference} value={resolveReferenceId(entry)} />
          <ReceiptRow label={WALLET_COPY.receipt.timestamp} value={formatWalletDateTime(entry.createdAt)} />
          <ReceiptRow label={WALLET_COPY.receipt.amount} value={`${amountPrefix}${formatWalletCents(entry.amountCents)}`} />
          <ReceiptRow label={WALLET_COPY.receipt.fee} value={feeCents > 0 ? formatWalletCents(feeCents) : "—"} />
          <ReceiptRow label={WALLET_COPY.receipt.status} value={WALLET_STATUS_LABELS[status]} />
          <ReceiptRow
            label={WALLET_COPY.receipt.description}
            value={entry.description ?? formatWalletType(entry)}
          />
          {paymentMethod ? (
            <ReceiptRow label={WALLET_COPY.receipt.paymentMethod} value={paymentMethod} />
          ) : null}
        </div>

        <p className="text-center text-xs text-sb-muted">
          {WALLET_COPY.receipt.support}{" "}
          <Link
            href="/support"
            className="text-sb-glow hover:text-white font-medium transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {WALLET_COPY.receipt.supportLink}
          </Link>
        </p>
      </LandingGlassCard>
    </div>
  );
}
