import type { PolicyDocument } from "../types";

export const companyOverview: PolicyDocument = {
  sections: [
    {
      heading: "Document ALD-COR-001 — Company Overview",
      subsections: [
        {
          paragraphs: [
            "This document describes the corporate structure, mission, and operational framework of ALTIVORA LABS LLC and its SquareBoards platform for partners conducting due diligence.",
          ],
        },
      ],
    },
    {
      heading: "1. Corporate Profile",
      subsections: [
        {
          bullets: [
            "Entity name: ALTIVORA LABS LLC",
            "Doing business as: SquareBoards™",
            "Formation: United States limited liability company",
            "Industry: Technology — competitive sports contest platform",
            "Headquarters: United States (operational team distributed)",
            "Primary contact: support@squareboards.pro | Legal: legal@squareboards.pro",
          ],
        },
      ],
    },
    {
      heading: "2. Mission and Product Philosophy",
      subsections: [
        {
          paragraphs: [
            "SquareBoards exists to deliver the world's premier competitive sports experience. The platform is designed for competitors — not bettors. Every product decision prioritizes fair competition, community, progression, and trust over transactional volume.",
          ],
          bullets: [
            "Skill-based contests with transparent scoring and published payout structures.",
            "No house-edge wagering model — customers compete against each other in defined contests.",
            "Premium user experience aligned with best-in-class consumer technology standards.",
            "Community-first design with social features, leaderboards, and legacy progression.",
          ],
        },
      ],
    },
    {
      heading: "3. Platform Architecture",
      subsections: [
        {
          paragraphs: [
            "SquareBoards is built on a modular platform architecture separating presentation, business logic, and financial operations.",
          ],
          bullets: [
            "Contest Engine: Manages contest lifecycle, scoring, and prize allocation.",
            "SquareBank™: Internal ledger for all financial postings with double-entry integrity.",
            "SquareWallet™: Customer-facing wallet for deposits, entries, and withdrawals.",
            "PaymentEngine™: Provider-agnostic payment orchestration layer.",
            "Identity Engine: KYC verification, account security, and fraud signals.",
            "Trust Center: Public policy hub for transparency and partner documentation.",
          ],
        },
      ],
    },
    {
      heading: "4. Customer Journey",
      subsections: [
        {
          numbered: [
            "Registration: Email or social authentication with terms acceptance and age verification.",
            "Account funding: Deposit to SquareWallet via approved payment method.",
            "Contest discovery: Browse active contests by sport, format, and entry fee.",
            "Entry: Select squares or contest positions; fee debited from wallet or charged directly.",
            "Live experience: Real-time scoring, community activity, and platform events.",
            "Settlement: Contest closes; winners determined by published rules; prizes credited to wallet.",
            "Withdrawal: KYC-verified customers request payout to linked bank account or debit card.",
          ],
        },
      ],
    },
    {
      heading: "5. Governance Structure",
      subsections: [
        {
          bullets: [
            "Executive leadership oversees product, engineering, compliance, and customer operations.",
            "Documented change management for contest rules, fee structures, and policy updates.",
            "Admin Command Center with role-based access, audit logging, and least-privilege controls.",
            "Regular review of state eligibility requirements and regulatory developments.",
            "Published Trust Center policies updated with version tracking and last-updated dates.",
          ],
        },
      ],
    },
    {
      heading: "6. Partner and Vendor Relationships",
      subsections: [
        {
          paragraphs: [
            "SquareBoards maintains relationships with payment processors, identity verification providers, cloud infrastructure vendors, and customer communication platforms. All vendors handling personal or financial data are subject to contractual security and confidentiality requirements.",
          ],
        },
      ],
    },
  ],
  footerNote:
    "Document ID: ALD-COR-001 | Classification: Corporate Due Diligence | Last Updated: June 2026 | Contact: legal@squareboards.pro",
};
