interface ChartProps {
  title: string;
  subtitle?: string;
  height?: number;
  className?: string;
}

export default function Chart({
  title,
  subtitle,
  height = 220,
  className = "",
}: ChartProps) {
  const bars = [42, 68, 55, 82, 64, 91, 73, 88, 60, 95, 78, 84];

  return (
    <article className={`ops-glass-card ops-chart-card ${className}`} aria-busy="true">
      <header className="ops-card-header">
        <div>
          <h3 className="ops-card-title">{title}</h3>
          {subtitle && <p className="ops-card-subtitle">{subtitle}</p>}
        </div>
        <span className="ops-badge ops-badge-muted">Preview</span>
      </header>
      <div
        className="ops-chart-skeleton"
        style={{ height }}
        role="img"
        aria-label={`${title} chart placeholder`}
      >
        <div className="ops-chart-bars">
          {bars.map((h, i) => (
            <div
              key={i}
              className="ops-chart-bar"
              style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
        <div className="ops-chart-grid" aria-hidden="true" />
      </div>
    </article>
  );
}
