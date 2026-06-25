export const ALTIVORA_LABS_LOGO = "/brand/altivora-labs-logo.png";

const LOGO_SIZE = {
  default: 100,
  compact: 72,
} as const;

type AltivoraLabsLogoMarkProps = {
  size?: number;
  className?: string;
};

export function AltivoraLabsLogoMark({
  size = LOGO_SIZE.default,
  className = "",
}: AltivoraLabsLogoMarkProps) {
  return (
    // Native img avoids Next.js image optimizer serving a stale cached variant.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ALTIVORA_LABS_LOGO}
      alt="ALTIVORA LABS"
      width={size}
      height={size}
      className={className}
      decoding="async"
    />
  );
}

type AltivoraCorporateSealProps = {
  compact?: boolean;
  className?: string;
};

export default function AltivoraCorporateSeal({
  compact = false,
  className = "",
}: AltivoraCorporateSealProps) {
  const logoSize = compact ? LOGO_SIZE.compact : LOGO_SIZE.default;

  return (
    <div
      className={[
        "landing-corporate-seal",
        compact ? "landing-corporate-seal--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="landing-corporate-built">Built by</p>
      <AltivoraLabsLogoMark
        size={logoSize}
        className="landing-corporate-logo"
      />
      <p className="landing-corporate-tagline">Engineering Trust Through Software</p>
      <p className="landing-corporate-meta">Established 2026 • Florida, USA</p>
    </div>
  );
}
