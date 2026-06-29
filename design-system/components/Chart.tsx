import { cn } from "../utils/cn";

export type ChartVariant =
  | "executive"
  | "revenue"
  | "growth"
  | "player"
  | "geographic"
  | "heatmap";

export interface ChartProps {
  variant?: ChartVariant;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Bar heights 0–100 for bar chart variants */
  bars?: number[];
}

const VARIANT_CLASS: Record<ChartVariant, string> = {
  executive: "sqds-chart--executive",
  revenue: "sqds-chart--revenue",
  growth: "sqds-chart--growth",
  player: "sqds-chart--player",
  geographic: "sqds-chart--geographic",
  heatmap: "sqds-chart--heatmap",
};

const DEFAULT_BARS = [35, 55, 42, 68, 48, 72, 58, 85, 62, 78, 45, 90];

function HeatmapGrid() {
  const levels = ["", "", "sqds-chart__cell--mid", "sqds-chart__cell--high", "sqds-chart__cell--high"];
  return (
    <div className="sqds-chart__grid">
      {Array.from({ length: 64 }, (_, i) => {
        const level = levels[i % levels.length];
        return <div key={i} className={cn("sqds-chart__cell", level)} />;
      })}
    </div>
  );
}

export function Chart({
  variant = "executive",
  title = "Chart",
  subtitle,
  className,
  bars = DEFAULT_BARS,
}: ChartProps) {
  const isGrid = variant === "geographic" || variant === "heatmap";

  return (
    <div className={cn("sqds-chart", VARIANT_CLASS[variant], className)}>
      <header className="sqds-chart__header">
        <div>
          <h4 className="sqds-chart__title">{title}</h4>
          {subtitle ? <p className="sqds-text-caption">{subtitle}</p> : null}
        </div>
      </header>
      <div className="sqds-chart__body">
        {isGrid ? (
          <HeatmapGrid />
        ) : (
          bars.map((height, i) => (
            <div
              key={i}
              className="sqds-chart__bar"
              style={{ height: `${Math.max(12, height)}%` }}
              role="presentation"
            />
          ))
        )}
      </div>
    </div>
  );
}
