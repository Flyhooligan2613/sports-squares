"use client";

import { useEffect, useRef, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency } from "@/lib/liveWinners/format";
import { triggerLiveTvSound } from "@/lib/liveTv/useLiveTvSound";
import type { LiveTvWinnerAnnouncement } from "@/lib/liveTv/types";

interface WinnerAnnouncementOverlayProps {
  winner: LiveTvWinnerAnnouncement | null;
}

const DISPLAY_MS = 6000;

export default function WinnerAnnouncementOverlay({
  winner,
}: WinnerAnnouncementOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<LiveTvWinnerAnnouncement | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!winner) return;
    if (initialLoadRef.current) {
      seenRef.current.add(winner.id);
      initialLoadRef.current = false;
      return;
    }
    if (seenRef.current.has(winner.id)) return;
    seenRef.current.add(winner.id);
    setCurrent(winner);
    setVisible(true);
    triggerLiveTvSound("winner", winner);
    const timeout = window.setTimeout(() => setVisible(false), DISPLAY_MS);
    return () => window.clearTimeout(timeout);
  }, [winner]);

  if (!visible || !current) return null;

  return (
    <div className="livetv-winner-overlay" role="status" aria-live="assertive">
      <LandingGlassCard glow className="livetv-winner-card p-6 sm:p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-sb-gold mb-2">
          🏆 New Winner
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {current.awayTeam}{" "}
          <span className="text-sb-muted font-normal">vs</span> {current.homeTeam}
        </h2>
        <p className="text-sm text-sb-muted mb-4">{current.periodLabel}</p>
        <p className="text-xl font-bold text-white">{current.maskedName}</p>
        <p className="text-4xl sm:text-5xl font-bold text-sb-gold tabular-nums my-3">
          {formatCurrency(current.amount)}
        </p>
        {current.paidAutomatically ? (
          <p className="text-sm font-semibold text-sb-success">Paid Automatically</p>
        ) : (
          <p className="text-sm font-semibold text-yellow-300">Payout Processing</p>
        )}
      </LandingGlassCard>
    </div>
  );
}
