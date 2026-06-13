"use client";

import { useEffect, useState } from "react";

function formatCountdownParts(ms: number): {
  label: string;
  isLive: boolean;
  isTomorrow: boolean;
} {
  if (ms <= 0) {
    return { label: "LIVE", isLive: true, isTomorrow: false };
  }

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (days > 0) {
    return {
      label: `${days}d ${hours}h ${pad(minutes)}m`,
      isLive: false,
      isTomorrow: days === 1 && hours < 12,
    };
  }
  if (hours > 0) {
    return {
      label: `${hours}h ${pad(minutes)}m ${pad(seconds)}s`,
      isLive: false,
      isTomorrow: false,
    };
  }
  if (minutes > 0) {
    return {
      label: `${minutes}m ${pad(seconds)}s`,
      isLive: false,
      isTomorrow: false,
    };
  }
  return {
    label: `${seconds}s`,
    isLive: false,
    isTomorrow: false,
  };
}

export function useKickoffCountdown(kickoffAt: string, forceLive = false) {
  const [state, setState] = useState({
    label: "—",
    isLive: forceLive,
    isTomorrow: false,
  });

  useEffect(() => {
    const target = new Date(kickoffAt).getTime();

    const tick = () => {
      if (forceLive) {
        setState({ label: "LIVE", isLive: true, isTomorrow: false });
        return;
      }
      setState(formatCountdownParts(target - Date.now()));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [kickoffAt, forceLive]);

  return state;
}
