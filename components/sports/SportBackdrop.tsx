"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import { getSportBackdrop } from "@/lib/sports/sportBackdrops";

export type SportBackdropVariant = "full" | "panel" | "section";

interface SportBackdropProps {
  sportId: string;
  variant?: SportBackdropVariant;
  className?: string;
  /** Pin to viewport for full-page sport hubs */
  fixed?: boolean;
}

export default function SportBackdrop({
  sportId,
  variant = "section",
  className = "",
  fixed = false,
}: SportBackdropProps) {
  const reducedMotion = useReducedMotion();
  const backdrop = getSportBackdrop(sportId);

  return (
    <div
      className={[
        "sport-backdrop",
        `sport-backdrop--${variant}`,
        fixed ? "sport-backdrop--fixed" : "",
        reducedMotion ? "sport-backdrop--reduced" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
      data-sport-id={backdrop.id}
      style={{ "--sport-backdrop-accent": backdrop.accentColor } as CSSProperties}
    >
      {backdrop.imagePath ? (
        <Image
          src={backdrop.imagePath}
          alt=""
          fill
          sizes={variant === "panel" ? "100vw" : "(max-width: 768px) 100vw, 80vw"}
          className="sport-backdrop-image"
          loading="lazy"
          priority={false}
        />
      ) : null}

      <div className={["sport-backdrop-gradient", backdrop.gradientClass].join(" ")} />
      {backdrop.patternClass ? (
        <div className={["sport-backdrop-pattern", backdrop.patternClass].join(" ")} />
      ) : null}
      {backdrop.artClass ? (
        <div className={["sport-backdrop-art", backdrop.artClass].join(" ")} />
      ) : null}
      <div className="sport-backdrop-overlay" />
    </div>
  );
}
