"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PHONE_SCREENS } from "@/lib/landing/blackLabelContent";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import LandingPhoneScreen from "@/components/landing/LandingPhoneScreen";

const ROTATE_MS = 4500;
const SWIPE_THRESHOLD_PX = 40;

export default function LandingPhoneShowcase() {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<number | null>(null);
  const swipeRef = useRef<{ startX: number; startY: number } | null>(null);

  const clearAutoRotate = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoRotate = useCallback(() => {
    if (reduced) return;
    clearAutoRotate();

    const tick = () => {
      setActiveIndex((prev) => (prev + 1) % PHONE_SCREENS.length);
      timerRef.current = window.setTimeout(tick, ROTATE_MS);
    };

    timerRef.current = window.setTimeout(tick, ROTATE_MS);
  }, [clearAutoRotate, reduced]);

  const resetAutoRotate = useCallback(() => {
    startAutoRotate();
  }, [startAutoRotate]);

  useEffect(() => {
    startAutoRotate();
    return clearAutoRotate;
  }, [startAutoRotate, clearAutoRotate]);

  const goToIndex = useCallback(
    (index: number) => {
      setActiveIndex(index);
      resetAutoRotate();
    },
    [resetAutoRotate],
  );

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % PHONE_SCREENS.length);
    resetAutoRotate();
  }, [resetAutoRotate]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + PHONE_SCREENS.length) % PHONE_SCREENS.length);
    resetAutoRotate();
  }, [resetAutoRotate]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    swipeRef.current = { startX: event.clientX, startY: event.clientY };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeRef.current) return;

    const { startX, startY } = swipeRef.current;
    swipeRef.current = null;
    setIsDragging(false);

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) goNext();
      else goPrev();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    swipeRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="landing-phone-showcase" aria-label="SquareBoards app preview">
      <div className="landing-phone-glow" aria-hidden />
      <div className="landing-phone-frame">
        <div className="landing-phone-notch" aria-hidden />
        <div
          className={[
            "landing-phone-screen",
            isDragging ? "landing-phone-screen-dragging" : "",
          ].join(" ")}
          role="region"
          aria-roledescription="carousel"
          aria-label="App screens — swipe or drag to browse"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerCancel}
        >
          {PHONE_SCREENS.map((screen, index) => (
            <div
              key={screen.id}
              className={[
                "landing-phone-screen-layer",
                index === activeIndex ? "landing-phone-screen-active" : "",
              ].join(" ")}
              aria-hidden={index !== activeIndex}
            >
              <LandingPhoneScreen screen={screen.id} />
            </div>
          ))}
        </div>
        <div className="landing-phone-home-indicator" aria-hidden />
      </div>

      <div className="landing-phone-dots" role="tablist" aria-label="App screen preview">
        {PHONE_SCREENS.map((screen, index) => (
          <button
            key={screen.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={screen.label}
            className={[
              "landing-phone-dot",
              index === activeIndex ? "landing-phone-dot-active" : "",
            ].join(" ")}
            onClick={() => goToIndex(index)}
          />
        ))}
      </div>
      <p
        className="landing-phone-caption text-center text-xs text-sb-muted mt-4"
        aria-live="polite"
      >
        {PHONE_SCREENS[activeIndex]?.label}
        <span className="landing-phone-swipe-hint" aria-hidden>
          {" · Swipe to explore"}
        </span>
      </p>
    </div>
  );
}
