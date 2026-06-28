"use client";

import { useEffect, useRef, useState } from "react";

interface FlipScoreProps {
  value: number;
  className?: string;
}

export default function FlipScore({ value, className = "" }: FlipScoreProps) {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    setFlipping(true);
    const t = window.setTimeout(() => {
      setDisplay(value);
      setFlipping(false);
      prev.current = value;
    }, 180);
    return () => window.clearTimeout(t);
  }, [value]);

  return (
    <span className={`la-flip-wrap font-mono tabular-nums ${className}`}>
      <span
        key={`${display}-${flipping}`}
        className={flipping ? "la-flip-digit" : ""}
      >
        {display}
      </span>
    </span>
  );
}
