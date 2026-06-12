import type { HTMLAttributes, ReactNode } from "react";

type Padding = "none" | "sm" | "md" | "lg";

interface LandingGlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  padding?: Padding;
  className?: string;
}

const PADDING_CLASS: Record<Padding, string> = {
  none: "",
  sm: "landing-glass-card-padding-sm",
  md: "landing-glass-card-padding-md",
  lg: "landing-glass-card-padding-lg",
};

export default function LandingGlassCard({
  children,
  hover = true,
  glow = false,
  padding = "none",
  className = "",
  ...props
}: LandingGlassCardProps) {
  return (
    <div
      className={[
        "landing-glass-card sb-card-interactive",
        hover ? "landing-glass-card-hover" : "",
        glow ? "landing-glass-card-glow" : "",
        PADDING_CLASS[padding],
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
