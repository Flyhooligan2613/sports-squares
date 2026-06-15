"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const THRESHOLD_PX = 72;
const MAX_PULL_PX = 120;

export default function PullToRefresh({
  onRefresh,
  children,
  className = "",
  disabled = false,
}: PullToRefreshProps) {
  const reducedMotion = useReducedMotion();
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullPx, setPullPx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const runRefresh = useCallback(async () => {
    if (refreshing || disabled) return;
    setRefreshing(true);
    setPullPx(reducedMotion ? 0 : 48);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPullPx(0);
    }
  }, [disabled, onRefresh, refreshing, reducedMotion]);

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || refreshing) return;
      if (window.scrollY > 8) return;
      startY.current = event.touches[0]?.clientY ?? 0;
      pulling.current = true;
    },
    [disabled, refreshing]
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!pulling.current || disabled || refreshing) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = Math.max(0, currentY - startY.current);
      if (delta <= 0) return;
      if (window.scrollY > 8) {
        pulling.current = false;
        setPullPx(0);
        return;
      }
      setPullPx(Math.min(MAX_PULL_PX, delta * 0.55));
    },
    [disabled, refreshing]
  );

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullPx >= THRESHOLD_PX) {
      await runRefresh();
      return;
    }
    setPullPx(0);
  }, [pullPx, runRefresh]);

  const ready = pullPx >= THRESHOLD_PX;

  return (
    <div
      className={["pull-to-refresh-root", className].filter(Boolean).join(" ")}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => void onTouchEnd()}
      onTouchCancel={() => {
        pulling.current = false;
        setPullPx(0);
      }}
    >
      <div
        className={[
          "pull-to-refresh-indicator",
          refreshing ? "pull-to-refresh-indicator-active" : "",
          ready ? "pull-to-refresh-indicator-ready" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ height: refreshing ? 48 : pullPx }}
        aria-hidden={!refreshing && pullPx <= 0}
      >
        <span className="pull-to-refresh-spinner" />
        <span className="pull-to-refresh-label">
          {refreshing ? "Refreshing…" : ready ? "Release to refresh" : "Pull to refresh"}
        </span>
      </div>
      {children}
    </div>
  );
}
