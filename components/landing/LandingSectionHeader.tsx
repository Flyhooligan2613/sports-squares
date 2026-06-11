interface LandingSectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  eyebrow?: string;
}

export default function LandingSectionHeader({
  title,
  subtitle,
  align = "center",
  className = "",
  eyebrow,
}: LandingSectionHeaderProps) {
  return (
    <div
      className={[
        "landing-section-header",
        align === "center" ? "text-center mx-auto" : "text-left",
        className,
      ].join(" ")}
    >
      {eyebrow && (
        <p className="landing-section-eyebrow">{eyebrow}</p>
      )}
      <h2 className="landing-section-title">{title}</h2>
      {subtitle && (
        <p className="landing-section-subtitle">{subtitle}</p>
      )}
    </div>
  );
}
