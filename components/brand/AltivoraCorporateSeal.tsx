import Image from "next/image";

export const ALTIVORA_LABS_LOGO = "/brand/altivora-labs-logo.png";

type AltivoraCorporateSealProps = {
  compact?: boolean;
  className?: string;
};

export default function AltivoraCorporateSeal({
  compact = false,
  className = "",
}: AltivoraCorporateSealProps) {
  const logoSize = compact ? 58 : 78;

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
      <Image
        src={ALTIVORA_LABS_LOGO}
        alt="ALTIVORA LABS"
        width={logoSize}
        height={logoSize}
        className="landing-corporate-logo"
        priority={!compact}
      />
      <p className="landing-corporate-tagline">Engineering Trust Through Software</p>
      <p className="landing-corporate-meta">Established 2026 • Florida, USA</p>
    </div>
  );
}
