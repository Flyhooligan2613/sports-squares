"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import PlayerAvatar from "@/components/player/PlayerAvatar";
import WelcomeHomeSummary from "@/components/home/WelcomeHomeSummary";
import { prioritizeStatusItems } from "@/lib/home/prioritizeActions";
import type { HomeData } from "@/lib/gameDay/types";

const LOGO_MS = 850;
const WELCOME_MS = 1650;
const EXIT_MS = 420;

type WelcomePhase = "logo" | "welcome" | "exit" | "done";

interface WelcomeHomeTransitionProps {
  data: HomeData | null;
  onComplete: () => void;
}

export default function WelcomeHomeTransition({ data, onComplete }: WelcomeHomeTransitionProps) {
  const [phase, setPhase] = useState<WelcomePhase>("logo");
  const logoStartedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (logoStartedRef.current) return;
    logoStartedRef.current = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      onComplete();
      return;
    }

    const logoTimer = window.setTimeout(() => {
      setPhase("welcome");
    }, LOGO_MS);

    return () => window.clearTimeout(logoTimer);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== "welcome" || !data) return;

    const welcomeTimer = window.setTimeout(() => setPhase("exit"), WELCOME_MS);
    return () => window.clearTimeout(welcomeTimer);
  }, [phase, data]);

  useEffect(() => {
    if (phase !== "exit") return;

    const exitTimer = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      setPhase("done");
      onComplete();
    }, EXIT_MS);

    return () => window.clearTimeout(exitTimer);
  }, [phase, onComplete]);

  if (phase === "done") return null;

  const summaryItems = data ? prioritizeStatusItems(data.statusItems) : [];

  return (
    <div
      className={[
        "welcome-home-overlay",
        phase === "logo" ? "welcome-home-overlay-logo" : "",
        phase === "welcome" ? "welcome-home-overlay-welcome" : "",
        phase === "exit" ? "welcome-home-overlay-exit" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
      role="dialog"
      aria-label="Welcome home"
    >
      <div className="welcome-home-overlay-glow" aria-hidden />

      {phase === "logo" ? (
        <div className="welcome-home-logo-stage">
          <Logo href={false} className="welcome-home-logo text-2xl sm:text-3xl" />
        </div>
      ) : null}

      {phase === "welcome" || phase === "exit" ? (
        <div className="welcome-home-personal-stage">
          {data ? (
            <>
              <PlayerAvatar
                emoji={data.avatarEmoji}
                size="lg"
                className="welcome-home-avatar mx-auto mb-5"
              />
              <h1 className="welcome-home-greeting">{data.greeting}</h1>
              <p className="welcome-home-subtitle">{data.greetingSubtitle}</p>
              <WelcomeHomeSummary items={summaryItems} />
              <p className="welcome-home-gameroom-hint">
                When you&apos;re caught up, explore the Game Room for every game on the platform.
              </p>
            </>
          ) : (
            <p className="text-sm text-sb-muted animate-pulse">Preparing your Home…</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
