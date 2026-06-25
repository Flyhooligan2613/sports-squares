import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

function getSectionHref(section: TrustAccordionSection): string {
  if (isMerchantSection(section)) {
    return `/trust/${section.slug}`;
  }
  return section.route;
}

interface TrustPolicyAccordionItemProps {
  section: TrustAccordionSection;
}

export default function TrustPolicyAccordionItem({ section }: TrustPolicyAccordionItemProps) {
  const href = getSectionHref(section);

  return (
    <Link href={href} className="trust-policy-link-card group">
      <span className="trust-policy-link-icon" aria-hidden>
        <TrustLucideIcon name={section.lucideIcon} className="w-5 h-5" />
      </span>
      <span className="trust-policy-link-body">
        <span className="trust-policy-link-row">
          <span className="trust-policy-link-title">{section.title}</span>
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
        <span className="trust-policy-link-description">{section.description}</span>
      </span>
      <ChevronRight className="trust-policy-link-arrow" aria-hidden />
    </Link>
  );
}
