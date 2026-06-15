"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLiveActivitySafe } from "@/components/liveActivity/LiveActivityProvider";
import {
  LIVE_ACTIVITY_ANIM_MS,
  LIVE_ACTIVITY_CELEBRATION_MS,
  LIVE_ACTIVITY_ROTATE_MS,
  type LiveActivityEvent,
} from "@/lib/liveActivity/types";

type TickerPhase = "idle" | "visible" | "exit" | "celebration";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export default function LiveActivityTicker({ className = "" }: { className?: string }) {
  const live = useLiveActivitySafe();
  const reducedMotion = usePrefersReducedMotion();
  const [current, setCurrent] = useState<LiveActivityEvent | null>(null);
  const [phase, setPhase] = useState<TickerPhase>("idle");
  const pausedRef = useRef(false);
  const initRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const showEvent = useCallback(
    (event: LiveActivityEvent) => {
      setCurrent(event);

      if (event.isCelebration && event.celebration && !reducedMotion) {
        setPhase("celebration");
        schedule(() => {
          setPhase("visible");
        }, LIVE_ACTIVITY_CELEBRATION_MS);
        return;
      }

      if (reducedMotion) {
        setPhase("visible");
        return;
      }

      setPhase("visible");
    },
    [reducedMotion, schedule]
  );

  const rotate = useCallback(() => {
    if (!live || pausedRef.current) return;
    const next = live.advance();
    if (!next) return;

    if (reducedMotion) {
      setCurrent(next);
      setPhase("visible");
      return;
    }

    setPhase("exit");
    schedule(() => {
      showEvent(next);
    }, LIVE_ACTIVITY_ANIM_MS);
  }, [live, reducedMotion, schedule, showEvent]);

  useEffect(() => {
    if (!live) return;
    if (initRef.current) return;
    initRef.current = true;

    const first = live.advance();
    if (!first) return;

    setCurrent(first);
    if (first.isCelebration && first.celebration && !reducedMotion) {
      setPhase("celebration");
      schedule(() => setPhase("visible"), LIVE_ACTIVITY_CELEBRATION_MS);
    } else {
      setPhase("visible");
    }
  }, [live, reducedMotion, schedule]);

  useEffect(() => {
    if (!live) return undefined;

    function onVisibilityChange() {
      pausedRef.current = document.hidden;
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    onVisibilityChange();

    const interval = window.setInterval(() => {
      if (!document.hidden) rotate();
    }, LIVE_ACTIVITY_ROTATE_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
      clearTimers();
    };
  }, [live, rotate, clearTimers]);

  if (!live || !current) return null;

  const animClass =
    phase === "exit"
      ? "live-activity-ticker-exit"
      : phase === "visible"
        ? "live-activity-ticker-enter"
        : phase === "celebration"
          ? "live-activity-ticker-celebration"
          : "";

  if (phase === "celebration" && current.celebration) {
    const c = current.celebration;
    return (
      <div
        className={["live-activity-ticker-root live-activity-ticker-root-celebration", className]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        <div className={`live-activity-ticker-celebration-card ${animClass}`}>
          <p className="live-activity-ticker-celebration-headline">{c.headline}</p>
          <p className="live-activity-ticker-celebration-name">{c.title}</p>
          {c.amount ? (
            <p className="live-activity-ticker-celebration-amount">{c.amount}</p>
          ) : null}
          {c.subtitle ? (
            <p className="live-activity-ticker-celebration-sub">{c.subtitle}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={["live-activity-ticker-root", className].filter(Boolean).join(" ")}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <div className={`live-activity-ticker-bar ${animClass}`}>
        <span className="live-activity-ticker-emoji" aria-hidden>
          {current.emoji}
        </span>
        <p className="live-activity-ticker-message">{current.message}</p>
        <span className="live-activity-ticker-live" aria-hidden>
          LIVE
        </span>
      </div>
    </div>
  );
}
