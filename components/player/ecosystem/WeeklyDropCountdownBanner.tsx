"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDropCountdown } from "@/lib/platform/ecosystem/weeklyDropSchedule";
import type { WeeklyDropSchedule } from "@/lib/gameDay/types";
import { SQUARE_DROP_NAME } from "@/lib/platform/ecosystem/squareDropBrand";

export default function WeeklyDropCountdownBanner({
  schedule,
  variant = "default",
}: {
  schedule: WeeklyDropSchedule;
  variant?: "default" | "compact";
}) {
  const [msLeft, setMsLeft] = useState(schedule.msUntilNext);

  useEffect(() => {
    setMsLeft(schedule.msUntilNext);
  }, [schedule.msUntilNext]);

  useEffect(() => {
    if (schedule.hasUnopenedDrop) return;
    if (!schedule.hasStartedDropTimer) return;

    const tick = () => {
      if (!schedule.nextDropAt) return;
      const remaining = new Date(schedule.nextDropAt).getTime() - Date.now();
      setMsLeft(Math.max(0, remaining));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [schedule.hasUnopenedDrop, schedule.hasStartedDropTimer, schedule.nextDropAt]);

  if (schedule.hasUnopenedDrop) {
    return (
      <div className={`weekly-drop-banner weekly-drop-banner-ready ${variant}`}>
        <div className="weekly-drop-banner-inner">
          <p className="weekly-drop-banner-kicker">🎁 {SQUARE_DROP_NAME}</p>
          <p className="weekly-drop-banner-title">Your drop is ready — open it now!</p>
          <Link href="/my-games/rewards/square-drop" className="weekly-drop-banner-cta">
            Open Square Drop →
          </Link>
        </div>
      </div>
    );
  }

  if (!schedule.hasStartedDropTimer) {
    return (
      <div className={`weekly-drop-banner weekly-drop-banner-start ${variant}`}>
        <div className="weekly-drop-banner-inner">
          <p className="weekly-drop-banner-kicker">🎁 {SQUARE_DROP_NAME}</p>
          <p className="weekly-drop-banner-title">Start your drop timer</p>
          <p className="weekly-drop-banner-sub">
            Buy your first square or submit a Pick&apos;em line — your first drop unlocks 6 days later,
            then every 6 days after that.
          </p>
          <div className="weekly-drop-banner-links">
            <Link href="/games/nfl" className="weekly-drop-banner-link">
              Browse boards
            </Link>
            <Link href="/pickem/week" className="weekly-drop-banner-link">
              Enter Pick&apos;em
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const countdown = formatDropCountdown(msLeft);

  return (
    <div className={`weekly-drop-banner weekly-drop-banner-countdown ${variant}`}>
      <div className="weekly-drop-banner-inner">
        <p className="weekly-drop-banner-kicker">🎁 Next {SQUARE_DROP_NAME}</p>
        <p className="weekly-drop-banner-title">{countdown}</p>
        <p className="weekly-drop-banner-sub">
          {msLeft <= 0
            ? "Refreshing your drop status…"
            : "Your next Square Drop unlocks automatically — check back when the timer hits zero."}
        </p>
      </div>
    </div>
  );
}
