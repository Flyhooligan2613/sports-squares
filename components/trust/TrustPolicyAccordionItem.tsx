"use client";

import { ChevronRight } from "lucide-react";
import TrustPolicyContent from "@/components/trust/TrustPolicyContent";
import { getTrustPolicyContent } from "@/lib/trust/content";
import type { MerchantDocumentSection } from "@/lib/trust/merchantDocuments";
import type { TrustCenterSection, TrustPolicyStatus } from "@/lib/trust/types";
import { TrustLucideIcon } from "@/lib/trust/trustIcons";

const STATUS_LABELS: Record<TrustPolicyStatus, string> = {
  current: "Current",
  active: "Active",
  updated: "Updated",
};

type TrustAccordionSection = TrustCenterSection | MerchantDocumentSection;

function isMerchantSection(section: TrustAccordionSection): section is MerchantDocumentSection {
  return "documentId" in section;
}

interface TrustPolicyAccordionItemProps {
  section: TrustAccordionSection;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function TrustPolicyAccordionItem({
  section,
  isExpanded,
  onToggle,
}: TrustPolicyAccordionItemProps) {
  const policy = getTrustPolicyContent(section.slug);
  const panelId = `trust-panel-${section.slug}`;
  const headerId = `trust-header-${section.slug}`;

  return (
    <div
      className={[
        "trust-accordion-item",
        isExpanded ? "trust-accordion-item-expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        id={headerId}
        className="trust-accordion-trigger"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="trust-accordion-trigger-icon" aria-hidden>
          <TrustLucideIcon name={section.lucideIcon} className="w-5 h-5" />
        </span>
        <span className="trust-accordion-trigger-body">
          <span className="trust-accordion-trigger-row">
            <span className="trust-accordion-title">{section.title}</span>
            <span className="trust-status-badge">
              {isMerchantSection(section) ? (
                <>Open: {section.documentId}</>
              ) : (
                <>
                  <span aria-hidden>✓</span>
                  {STATUS_LABELS[section.status]}
                </>
              )}
            </span>
          </span>
          <span className="trust-accordion-description">{section.description}</span>
        </span>
        <ChevronRight
          className={[
            "trust-accordion-arrow",
            isExpanded ? "trust-accordion-arrow-expanded" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!isExpanded}
        className="trust-accordion-panel"
        data-open={isExpanded}
      >
        <div className="trust-accordion-panel-inner">
          {policy ? (
            <div className="trust-accordion-content trust-policy-prose">
              <TrustPolicyContent document={policy} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
