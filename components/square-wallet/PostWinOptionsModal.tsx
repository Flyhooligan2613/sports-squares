"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

export interface PostWinOption {
  id: string;
  label: string;
  href: string;
}

interface PostWinOptionsModalProps {
  open: boolean;
  amountCents: number;
  contestName: string;
  options: PostWinOption[];
  onClose: () => void;
}

export default function PostWinOptionsModal({
  open,
  amountCents,
  contestName,
  options,
  onClose,
}: PostWinOptionsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <LandingGlassCard glow className="max-w-md w-full p-8 border border-sb-gold/30">
        <p className="text-xs uppercase tracking-wider text-sb-gold mb-2">Contest Win</p>
        <h2 className="text-2xl font-bold text-white mb-1">
          ${(amountCents / 100).toFixed(2)}
        </h2>
        <p className="text-sm text-sb-muted mb-6">{contestName}</p>
        <p className="text-xs text-sb-muted mb-4 leading-relaxed">
          Winnings are in your SquareWallet™. Choose your next move — no pressure to withdraw.
        </p>
        <div className="grid gap-2">
          {options.map((opt) => (
            <Button key={opt.id} href={opt.href} variant={opt.id === "keep_competing" ? "primary" : "secondary"}>
              {opt.label}
            </Button>
          ))}
          <Button variant="ghost" onClick={onClose}>
            Dismiss
          </Button>
        </div>
      </LandingGlassCard>
    </div>
  );
}
