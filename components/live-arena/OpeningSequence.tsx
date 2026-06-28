"use client";

import { useEffect, useState } from "react";

interface OpeningSequenceProps {
  onComplete: () => void;
  onGridReady?: () => void;
}

export default function OpeningSequence({
  onComplete,
  onGridReady,
}: OpeningSequenceProps) {
  const [phase, setPhase] = useState<"fade" | "spotlight" | "done">("fade");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("spotlight"), 600);
    const t2 = window.setTimeout(() => {
      onGridReady?.();
      setPhase("done");
    }, 1100);
    const t3 = window.setTimeout(onComplete, 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete, onGridReady]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {phase === "fade" && (
        <div className="absolute inset-0 bg-black la-fade-black" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={[
            "la-stadium-spotlight absolute inset-0",
            phase === "spotlight" ? "opacity-80" : "opacity-0",
          ].join(" ")}
          style={{ transition: "opacity 0.5s ease" }}
        />
        <p
          className={[
            "relative text-sm uppercase tracking-[0.35em] font-semibold la-opening-text",
            phase === "spotlight" ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          Entering Live Arena
        </p>
      </div>
    </div>
  );
}
