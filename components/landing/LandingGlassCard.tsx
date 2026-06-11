import type { HTMLAttributes, ReactNode } from "react";

interface LandingGlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export default function LandingGlassCard({
  children,
  hover = true,
  glow = false,
  className = "",
  ...props
}: LandingGlassCardProps) {
  return (
    <div
      className={[
        "landing-glass-card",
        hover ? "landing-glass-card-hover" : "",
        glow ? "landing-glass-card-glow" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
