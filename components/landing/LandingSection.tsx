import type { ReactNode } from "react";

type Variant = "default" | "alt" | "glow" | "narrow";

interface LandingSectionProps {
  id?: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  scrollMargin?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  default: "landing-section",
  alt: "landing-section landing-section-alt",
  glow: "landing-section landing-section-glow",
  narrow: "landing-section landing-section-narrow",
};

export default function LandingSection({
  id,
  variant = "default",
  className = "",
  children,
  scrollMargin = false,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={[
        VARIANTS[variant],
        scrollMargin ? "scroll-mt-20" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="landing-section-ambient" aria-hidden />
      <div className="landing-section-inner">{children}</div>
    </section>
  );
}
