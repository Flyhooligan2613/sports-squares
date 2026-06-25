import type { TrustLucideIconName } from "./trustIcons";

export interface MerchantDocumentSection {
  slug: string;
  lucideIcon: TrustLucideIconName;
  title: string;
  description: string;
  documentId: string;
}

export const MERCHANT_INFORMATION = {
  title: "Merchant Information",
  subtitle: "Business documentation describing how SquareBoards and ALTIVORA operate.",
  noteTitle: "Merchant Documentation",
  noteText:
    "These documents are provided for payment processors, banking partners, compliance teams, regulators, auditors, and business partners requiring additional information regarding SquareBoards merchant operations.",
} as const;

export const MERCHANT_DOCUMENT_SECTIONS: MerchantDocumentSection[] = [
  {
    slug: "merchant-executive-summary",
    lucideIcon: "FileText",
    title: "🏢 Merchant Executive Summary",
    description:
      "Executive overview of SquareBoards, merchant operations, payment processing, customer support, compliance, and platform governance.",
    documentId: "ALD-MER-001",
  },
  {
    slug: "company-overview",
    lucideIcon: "Users",
    title: "🏢 Company Overview",
    description:
      "Corporate overview of ALTIVORA, the SquareBoards platform, mission, governance, customer journey, and operational structure.",
    documentId: "ALD-COR-001",
  },
  {
    slug: "business-model",
    lucideIcon: "CreditCard",
    title: "🏢 Business Model",
    description:
      "How payments flow through SquareBoards including customer registration, contest entry, payment processing, settlement, reconciliation, and prize distribution.",
    documentId: "ALD-BUS-001",
  },
  {
    slug: "compliance-risk-management",
    lucideIcon: "ShieldCheck",
    title: "🛡 Compliance & Risk Management",
    description:
      "Enterprise compliance program, operational controls, fraud monitoring, customer protection, dispute management, and risk governance.",
    documentId: "ALD-CMP-001",
  },
];

export function getMerchantDocumentSlugs(): string[] {
  return MERCHANT_DOCUMENT_SECTIONS.map((section) => section.slug);
}

export function getMerchantDocumentBySlug(slug: string): MerchantDocumentSection | undefined {
  return MERCHANT_DOCUMENT_SECTIONS.find((section) => section.slug === slug);
}
