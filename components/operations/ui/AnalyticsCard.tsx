interface AnalyticsMetric {
  label: string;
  value: string;
  change?: string;
}

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  metrics: AnalyticsMetric[];
  className?: string;
}

export default function AnalyticsCard({
  title,
  subtitle,
  metrics,
  className = "",
}: AnalyticsCardProps) {
  return (
    <article className={`ops-glass-card ops-analytics-card ${className}`}>
      <header className="ops-card-header">
        <div>
          <h3 className="ops-card-title">{title}</h3>
          {subtitle && <p className="ops-card-subtitle">{subtitle}</p>}
        </div>
        <span className="ops-badge ops-badge-purple">Analytics</span>
      </header>
      <div className="ops-analytics-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="ops-analytics-metric">
            <p className="ops-analytics-value">{metric.value}</p>
            <p className="ops-analytics-label">{metric.label}</p>
            {metric.change && (
              <p className="ops-analytics-change">{metric.change}</p>
            )}
          </div>
        ))}
      </div>
      <div className="ops-analytics-sparkline" aria-hidden="true">
        <svg viewBox="0 0 200 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="opsSparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
            </linearGradient>
          </defs>
          <path
            d="M0,30 L20,25 L40,28 L60,18 L80,22 L100,12 L120,16 L140,8 L160,14 L180,6 L200,10 L200,40 L0,40 Z"
            fill="url(#opsSparkGradient)"
          />
          <path
            d="M0,30 L20,25 L40,28 L60,18 L80,22 L100,12 L120,16 L140,8 L160,14 L180,6 L200,10"
            fill="none"
            stroke="rgba(99, 102, 241, 0.8)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </article>
  );
}
