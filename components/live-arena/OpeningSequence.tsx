"use client";

import { useEffect, useState } from "react";

interface OpeningSequenceProps {
  onComplete: () => void;
  onGridReady?: () => void;
  contestName?: string;
}

export default function OpeningSequence({
  onComplete,
  onGridReady,
  contestName = "Live Arena",
}: OpeningSequenceProps) {
  const [phase, setPhase] = useState<
    "blackout" | "tunnel" | "spotlight" | "reveal" | "done"
  >("blackout");

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase("tunnel"), 400),
      window.setTimeout(() => setPhase("spotlight"), 900),
      window.setTimeout(() => {
        onGridReady?.();
        setPhase("reveal");
      }, 1500),
      window.setTimeout(() => setPhase("done"), 2100),
      window.setTimeout(onComplete, 2600),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onComplete, onGridReady]);

  return (
    <div className="la-opening fixed inset-0 z-[100] pointer-events-none">
      <div
        className={[
          "la-opening__blackout absolute inset-0 bg-black",
          phase === "blackout" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <div className="la-opening__tunnel absolute inset-0" aria-hidden>
        <div
          className={[
            "la-opening__tunnel-ring la-opening__tunnel-ring--1",
            phase === "tunnel" || phase === "spotlight" ? "la-opening__tunnel-ring--active" : "",
          ].join(" ")}
        />
        <div
          className={[
            "la-opening__tunnel-ring la-opening__tunnel-ring--2",
            phase === "spotlight" || phase === "reveal" ? "la-opening__tunnel-ring--active" : "",
          ].join(" ")}
        />
      </div>

      <div
        className={[
          "la-stadium-spotlight la-opening__spotlight absolute inset-0",
          phase === "spotlight" || phase === "reveal" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
        <p
          className={[
            "la-opening__eyebrow text-[10px] uppercase tracking-[0.4em] font-semibold text-blue-400/80",
            phase === "spotlight" || phase === "reveal" ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          Stepping Into The Stadium
        </p>
        <h2
          className={[
            "la-opening__title text-lg sm:text-xl font-bold tracking-tight text-center",
            phase === "reveal" ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          {contestName}
        </h2>
        <p
          className={[
            "la-opening__sub text-xs text-sb-muted tracking-widest uppercase",
            phase === "reveal" ? "opacity-80" : "opacity-0",
          ].join(" ")}
        >
          Board loading…
        </p>
      </div>

      <div
        className={[
          "la-opening__vignette absolute inset-0",
          phase === "done" ? "opacity-0" : "",
        ].join(" ")}
        aria-hidden
      />
    </div>
  );
}
