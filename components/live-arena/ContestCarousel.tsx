"use client";

import { useCallback, useEffect, useRef } from "react";
import type { LiveContest } from "@/lib/live-arena/types";

interface ContestCarouselProps {
  contests: LiveContest[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function ContestCarousel({
  contests,
  activeIndex,
  onChange,
}: ContestCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const isDragging = useRef(false);
  const scrollEndTimer = useRef<number | null>(null);

  const scrollToIndex = useCallback(
    (idx: number, smooth = true) => {
      const el = scrollRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      el.scrollTo({
        left: idx * w,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    []
  );

  useEffect(() => {
    scrollToIndex(activeIndex, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToIndex(activeIndex);
  }, [activeIndex, scrollToIndex]);

  const handleScrollEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    if (w === 0) return;
    const idx = Math.round(el.scrollLeft / w);
    const clamped = Math.max(0, Math.min(contests.length - 1, idx));
    if (clamped !== activeIndex) {
      onChange(clamped);
    }
  }, [activeIndex, contests.length, onChange]);

  const onScroll = () => {
    if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = window.setTimeout(handleScrollEnd, 80);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    isDragging.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const dx = touchStart.current.x - e.changedTouches[0].clientX;
    const dy = touchStart.current.y - e.changedTouches[0].clientY;
    const dt = Date.now() - touchStart.current.time;

    if (Math.abs(dy) > Math.abs(dx)) return;

    const velocity = Math.abs(dx) / Math.max(dt, 1);
    const threshold = velocity > 0.5 ? 30 : 50;

    if (Math.abs(dx) < threshold) {
      scrollToIndex(activeIndex);
      return;
    }

    if (dx > 0 && activeIndex < contests.length - 1) {
      onChange(activeIndex + 1);
    } else if (dx < 0 && activeIndex > 0) {
      onChange(activeIndex - 1);
    } else {
      scrollToIndex(activeIndex);
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="la-carousel-track -mx-4 px-4"
      >
        {contests.map((c, i) => (
          <div
            key={c.id}
            className={[
              "la-carousel-slide",
              i === activeIndex
                ? "la-carousel-slide--active"
                : "la-carousel-slide--inactive",
            ].join(" ")}
          >
            <div className="la-glass-card p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {c.awayTeam} vs {c.homeTeam}
                </p>
                <p className="text-[10px] text-sb-muted mt-0.5">
                  {c.contestType} · ${c.prizePool.toLocaleString()}
                </p>
              </div>
              {c.isLive ? (
                <span className="shrink-0 text-[10px] font-bold uppercase text-red-400 bg-red-500/15 px-2 py-1 rounded-full border border-red-500/30 la-live-badge">
                  Live
                </span>
              ) : (
                <span className="shrink-0 text-[10px] text-sb-muted">Upcoming</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-1.5">
        {contests.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Contest ${c.awayTeam} vs ${c.homeTeam}`}
            aria-current={i === activeIndex ? "true" : undefined}
            onClick={() => onChange(i)}
            className={[
              "la-carousel-dot h-1.5 rounded-full bg-white/20 w-1.5",
              i === activeIndex ? "la-carousel-dot-active" : "",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
