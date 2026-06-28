import { MapPin } from "lucide-react";

interface MapProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function Map({ title, subtitle, className = "" }: MapProps) {
  const pins = [
    { x: 22, y: 38, label: "NY" },
    { x: 35, y: 52, label: "FL" },
    { x: 12, y: 42, label: "CA" },
    { x: 48, y: 45, label: "TX" },
    { x: 62, y: 32, label: "IL" },
    { x: 78, y: 28, label: "MA" },
  ];

  return (
    <article className={`ops-glass-card ops-map-card ${className}`} aria-busy="true">
      <header className="ops-card-header">
        <div>
          <h3 className="ops-card-title">{title}</h3>
          {subtitle && <p className="ops-card-subtitle">{subtitle}</p>}
        </div>
        <span className="ops-badge ops-badge-muted">Preview</span>
      </header>
      <div
        className="ops-map-placeholder"
        role="img"
        aria-label={`${title} map placeholder`}
      >
        <div className="ops-map-grid" aria-hidden="true" />
        <div className="ops-map-gradient" aria-hidden="true" />
        {pins.map((pin) => (
          <div
            key={pin.label}
            className="ops-map-pin"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <MapPin className="w-4 h-4" strokeWidth={2} />
            <span className="ops-map-pin-label">{pin.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
