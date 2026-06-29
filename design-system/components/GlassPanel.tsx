import { cn } from "../utils/cn";

export type GlassPanelGlow = "none" | "purple" | "gold";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: GlassPanelGlow;
  padding?: "sm" | "md" | "lg";
}

const GLOW_CLASS: Record<GlassPanelGlow, string> = {
  none: "",
  purple: "sqds-glass--glow",
  gold: "sqds-glass--gold",
};

const PADDING_STYLE: Record<NonNullable<GlassPanelProps["padding"]>, React.CSSProperties> = {
  sm: { padding: "var(--sqds-space-4)" },
  md: { padding: "var(--sqds-space-5)" },
  lg: { padding: "var(--sqds-space-8)" },
};

export function GlassPanel({
  glow = "none",
  padding = "md",
  className,
  style,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn("sqds-glass", GLOW_CLASS[glow], className)}
      style={{ ...PADDING_STYLE[padding], ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
