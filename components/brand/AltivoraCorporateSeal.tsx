export const ALTIVORA_LABS_LOGO = "/brand/altivora-labs-logo.png?v=2";
/** Drop a horizontal PNG/SVG at public/brand/altivora-labs-wordmark.png to replace the mark + text row. */
export const ALTIVORA_LABS_WORDMARK = "/brand/altivora-labs-wordmark.png?v=2";

const LOGO_SIZE = {
  default: 64,
  compact: 52,
  wordmarkWidth: 148,
  wordmarkCompactWidth: 120,
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
      alt=""
      width={size}
      height={size}
      className={className}
      decoding="async"
      role="presentation"
    />
  );
}

type AltivoraLabsHorizontalBrandProps = {
  compact?: boolean;
  useWordmarkImage?: boolean;
};

export function AltivoraLabsHorizontalBrand({
  compact = false,
  useWordmarkImage = false,
}: AltivoraLabsHorizontalBrandProps) {
  const markSize = compact ? LOGO_SIZE.compact : LOGO_SIZE.default;
  const wordmarkWidth = compact
    ? LOGO_SIZE.wordmarkCompactWidth
    : LOGO_SIZE.wordmarkWidth;

  if (useWordmarkImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ALTIVORA_LABS_WORDMARK}
        alt="ALTIVORA LABS"
        width={wordmarkWidth}
        height={Math.round(wordmarkWidth * 0.28)}
        className="landing-corporate-wordmark-image"
        decoding="async"
      />
    );
  }

  return (
    <div className="landing-corporate-wordmark" aria-label="ALTIVORA LABS">
      <AltivoraLabsLogoMark
        size={markSize}
        className="landing-corporate-logo-mark"
      />
      <div className="landing-corporate-wordmark-text" aria-hidden="true">
        <span className="landing-corporate-wordmark-primary">ALTIVORA</span>
        <span className="landing-corporate-wordmark-secondary">LABS</span>
      </div>
    </div>
  );
}

type AltivoraCorporateSealProps = {
  compact?: boolean;
  className?: string;
  /** Set true after adding public/brand/altivora-labs-wordmark.png */
  useWordmarkImage?: boolean;
};

export default function AltivoraCorporateSeal({
  compact = false,
  className = "",
  useWordmarkImage = false,
}: AltivoraCorporateSealProps) {
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
      <AltivoraLabsHorizontalBrand
        compact={compact}
        useWordmarkImage={useWordmarkImage}
      />
      <p className="landing-corporate-tagline">Engineering Trust Through Software</p>
      <p className="landing-corporate-meta">Established 2026 • Florida, USA</p>
    </div>
  );
}
