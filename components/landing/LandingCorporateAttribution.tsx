import Image from "next/image";

export default function LandingCorporateAttribution() {
  return (
    <section className="landing-corporate-attribution" aria-label="Corporate attribution">
      <div className="landing-corporate-seal">
        <p className="landing-corporate-built">Built by</p>
        <Image
          src="/altivora/altivora-labs-logo.svg"
          alt="ALTIVORA LABS"
          width={200}
          height={32}
          className="landing-corporate-logo"
        />
        <p className="landing-corporate-tagline">Engineering Trust Through Software</p>
        <p className="landing-corporate-meta">Established 2026 · Florida, USA</p>
      </div>
    </section>
  );
}
