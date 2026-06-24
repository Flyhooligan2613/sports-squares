"use client";

import { useEffect, useState } from "react";
import { PHONE_SCREENS, type PhoneScreenId } from "@/lib/landing/blackLabelContent";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import LandingPhoneScreen from "@/components/landing/LandingPhoneScreen";

const ROTATE_MS = 5000;

export default function LandingPhoneShowcase() {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PHONE_SCREENS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const activeScreen = PHONE_SCREENS[activeIndex]?.id ?? "wallet";

  return (
    <div className="landing-phone-showcase" aria-label="SquareBoards app preview">
      <div className="landing-phone-glow" aria-hidden />
      <div className="landing-phone-frame">
        <div className="landing-phone-notch" aria-hidden />
        <div className="landing-phone-screen">
          {PHONE_SCREENS.map((screen, index) => (
            <div
              key={screen.id}
              className={[
                "landing-phone-screen-layer",
                index === activeIndex ? "landing-phone-screen-active" : "",
              ].join(" ")}
              aria-hidden={index !== activeIndex}
            >
              <LandingPhoneScreen screen={screen.id as PhoneScreenId} />
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
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
      <p className="landing-phone-caption text-center text-xs text-sb-muted mt-4">
        {PHONE_SCREENS[activeIndex]?.label}
      </p>
    </div>
  );
}
