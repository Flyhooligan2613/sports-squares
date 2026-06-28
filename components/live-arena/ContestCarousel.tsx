"use client";

import { useRef } from "react";
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
  const touchStart = useRef(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const idx = Math.round(el.scrollLeft / w);
    if (idx !== activeIndex && idx >= 0 && idx < contests.length) {
      onChange(idx);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < 40) return;
    if (delta > 0 && activeIndex < contests.length - 1) {
      onChange(activeIndex + 1);
      scrollRef.current?.scrollTo({
        left: (activeIndex + 1) * (scrollRef.current?.offsetWidth ?? 0),
        behavior: "smooth",
      });
    } else if (delta < 0 && activeIndex > 0) {
      onChange(activeIndex - 1);
      scrollRef.current?.scrollTo({
        left: (activeIndex - 1) * (scrollRef.current?.offsetWidth ?? 0),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {contests.map((c, i) => (
          <div
            key={c.id}
            className="snap-center shrink-0 w-full pr-3"
            style={{ scrollSnapAlign: "center" }}
          >
            <div
              className={[
                "la-glass-card p-3 flex items-center justify-between transition-opacity duration-300",
                i === activeIndex ? "opacity-100" : "opacity-60",
              ].join(" ")}
            >
              <div>
                <p className="text-sm font-semibold">
                  {c.awayTeam} vs {c.homeTeam}
                </p>
                <p className="text-[10px] text-sb-muted mt-0.5">
                  {c.contestType} · ${c.prizePool.toLocaleString()}
                </p>
              </div>
              {c.isLive ? (
                <span className="text-[10px] font-bold uppercase text-red-400 bg-red-500/15 px-2 py-1 rounded-full border border-red-500/30">
                  Live
                </span>
              ) : (
                <span className="text-[10px] text-sb-muted">Upcoming</span>
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
            onClick={() => {
              onChange(i);
              scrollRef.current?.scrollTo({
                left: i * (scrollRef.current.offsetWidth ?? 0),
                behavior: "smooth",
              });
            }}
            className={[
              "la-carousel-dot h-1.5 rounded-full bg-white/20",
              i === activeIndex ? "la-carousel-dot-active" : "w-1.5",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
