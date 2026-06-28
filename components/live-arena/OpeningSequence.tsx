"use client";

import { useEffect } from "react";

interface OpeningSequenceProps {
  onComplete: () => void;
}

export default function OpeningSequence({ onComplete }: OpeningSequenceProps) {
  useEffect(() => {
    const t = window.setTimeout(onComplete, 1200);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black la-fade-black" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="la-stadium-spotlight absolute inset-0 opacity-60" />
        <p className="relative text-sm uppercase tracking-[0.3em] text-white/40 font-semibold animate-pulse">
          Entering Live Arena
        </p>
      </div>
    </div>
  );
}
