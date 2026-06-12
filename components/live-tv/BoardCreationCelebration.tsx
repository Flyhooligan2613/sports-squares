"use client";

import { useEffect, useRef, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { triggerLiveTvSound } from "@/lib/liveTv/useLiveTvSound";
import type { LiveTvBoardEvent } from "@/lib/liveTv/types";

interface BoardCreationCelebrationProps {
  events: LiveTvBoardEvent[];
}

export default function BoardCreationCelebration({
  events,
}: BoardCreationCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<LiveTvBoardEvent | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const latest = events[0];
    if (!latest || seenRef.current.has(latest.id)) return;
    seenRef.current.add(latest.id);
    setCurrent(latest);
    setVisible(true);
    triggerLiveTvSound("board_sold_out", latest);
    const timeout = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [events]);

  if (!visible || !current) return null;

  return (
    <div className="livetv-board-event-banner" role="status">
      <LandingGlassCard className="p-4 sm:p-5 text-center livetv-board-event-card">
        <p className="text-sm font-bold text-sb-gold">
          🔥 BOARD #{current.soldOutBoardIndex} SOLD OUT
        </p>
        <p className="text-white font-semibold mt-2">
          Creating Board #{current.newBoardIndex}...
        </p>
        <p className="text-sm text-sb-success font-bold mt-2 livetv-countdown-glow">
          Ready — Board #{current.newBoardIndex} Open
        </p>
        <p className="text-xs text-sb-muted mt-1">
          {current.awayTeam} vs {current.homeTeam}
        </p>
      </LandingGlassCard>
    </div>
  );
}
