"use client";

import { useCallback, useState } from "react";
import TrustCenterBadges from "@/components/trust/TrustCenterBadges";
import TrustPolicyAccordionItem from "@/components/trust/TrustPolicyAccordionItem";
import { TRUST_CENTER_META } from "@/lib/trust/trustCenterMeta";
import {
  TRUST_CENTER_CATEGORIES,
  getTrustSectionsByCategory,
} from "@/lib/trust/trustCenterSections";
import { TrustLucideIcon } from "@/lib/trust/trustIcons";

export default function TrustCenterHub() {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const handleToggle = useCallback((slug: string) => {
    setExpandedSlug((current) => (current === slug ? null : slug));
  }, []);

  return (
    <div className="trust-center-hub not-prose">
      <header className="trust-center-header">
        <h1 className="trust-center-title">{TRUST_CENTER_META.title}</h1>
        <p className="trust-center-subtitle">{TRUST_CENTER_META.subtitle}</p>
        <p className="trust-center-intro">{TRUST_CENTER_META.intro}</p>
      </header>

      <TrustCenterBadges />

      <div className="trust-center-categories">
        {TRUST_CENTER_CATEGORIES.map((category) => {
          const sections = getTrustSectionsByCategory(category.id);
          return (
            <section
              key={category.id}
              className="trust-center-category"
              aria-labelledby={`trust-category-${category.id}`}
            >
              <div className="trust-center-category-heading">
                <TrustLucideIcon
                  name={category.lucideIcon}
                  className="trust-center-category-icon"
                />
                <h2 id={`trust-category-${category.id}`} className="trust-center-category-title">
                  {category.title}
                </h2>
              </div>
              <div className="trust-center-category-divider" aria-hidden />
              <div className="trust-center-category-items">
                {sections.map((section) => (
                  <TrustPolicyAccordionItem
                    key={section.slug}
                    section={section}
                    isExpanded={expandedSlug === section.slug}
                    onToggle={() => handleToggle(section.slug)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="trust-center-footer">
        <p>
          Last Updated: {TRUST_CENTER_META.lastUpdated} | Version {TRUST_CENTER_META.version}
        </p>
        <p>
          {TRUST_CENTER_META.company} | {TRUST_CENTER_META.brandMark} |{" "}
          {TRUST_CENTER_META.tagline} |{" "}
          <a href={TRUST_CENTER_META.websiteUrl} className="trust-center-footer-link">
            {TRUST_CENTER_META.website}
          </a>
        </p>
      </footer>
    </div>
  );
}
