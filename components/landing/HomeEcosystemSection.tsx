"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  getHomeEcosystemFeatures,
  type EcosystemFeature,
} from "@/lib/platform/ecosystemHome";

function EcosystemFeatureCard({ feature, index }: { feature: EcosystemFeature; index: number }) {
  const isAvailable = feature.status === "available" && feature.href;
  const style = {
    "--eco-accent": feature.accent ?? "#7b61ff",
    animationDelay: `${index * 40}ms`,
  } as CSSProperties;

  const inner = (
    <>
      <div className="home-ecosystem-card-glow" aria-hidden />
      <div className="home-ecosystem-card-top">
        <span className="home-ecosystem-card-emoji" aria-hidden>
          {feature.emoji}
        </span>
        <span
          className={[
            "home-ecosystem-card-badge",
            isAvailable ? "home-ecosystem-card-badge-vibe" : "home-ecosystem-card-badge-soon",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {feature.tagline}
        </span>
      </div>
      <h3 className="home-ecosystem-card-title">{feature.title}</h3>
      <ul className="home-ecosystem-card-bullets">
        {feature.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {isAvailable ? (
        <span className="home-ecosystem-card-cta">Get in the game →</span>
      ) : null}
    </>
  );

  const className = [
    "home-ecosystem-card",
    isAvailable ? "home-ecosystem-card-link" : "home-ecosystem-card-static",
  ]
    .filter(Boolean)
    .join(" ");

  if (isAvailable && feature.href) {
    return (
      <Link href={feature.href} className={className} style={style}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={className} style={style} aria-disabled={!isAvailable}>
      {inner}
    </div>
  );
}

export default function HomeEcosystemSection() {
  const features = getHomeEcosystemFeatures();

  return (
    <LandingSection id="ecosystem" variant="glow" className="home-ecosystem-section">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="The SquareBoards Ecosystem"
          title="Everything You Need. One Account."
          subtitle="Your SquareBoards account unlocks every current and future game on the platform."
          align="center"
        />
      </ScrollReveal>

      <div className="home-ecosystem-grid">
        {features.map((feature, index) => (
          <ScrollReveal key={feature.id} delay={index * 35}>
            <EcosystemFeatureCard feature={feature} index={index} />
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
