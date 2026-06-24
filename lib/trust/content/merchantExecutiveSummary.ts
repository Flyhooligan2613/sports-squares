import type { PolicyDocument } from "../types";

export const merchantExecutiveSummary: PolicyDocument = {
  sections: [
    {
      heading: "Document ALD-MER-001 — Merchant Executive Summary",
      subsections: [
        {
          paragraphs: [
            "This executive summary provides payment processors, banking partners, and underwriting teams with a consolidated view of SquareBoards merchant operations operated by ALTIVORA LABS LLC.",
            "SquareBoards is a premium competitive sports platform where customers participate in skill-based contests — not wagering against the house. Revenue is derived from contest entry fees, platform service fees, and optional premium membership products.",
          ],
        },
      ],
    },
    {
      heading: "1. Legal Entity and Platform",
      subsections: [
        {
          bullets: [
            "Legal entity: ALTIVORA LABS LLC, a United States limited liability company.",
            "Consumer brand: SquareBoards™ — premium multi-game competitive sports platform.",
            "Primary website: www.squareboards.pro",
            "Business classification: Skill-based contest platform with digital wallet and prize distribution.",
            "Geographic focus: United States, with state-level eligibility controls enforced at registration and entry.",
          ],
        },
      ],
    },
    {
      heading: "2. Merchant Operations Overview",
      subsections: [
        {
          paragraphs: [
            "SquareBoards operates as the merchant of record for contest entry purchases. Customer funds are collected through PCI-compliant payment processors, credited to internal SquareWallet™ ledger accounts, and applied to contest entries under published contest rules.",
          ],
          bullets: [
            "Customer onboarding with identity verification (KYC) prior to withdrawals.",
            "Contest catalog management with published rules, scoring, and payout schedules.",
            "SquareBank™ ledger for all balance movements — no direct balance manipulation.",
            "SquareWallet™ for customer-facing balances, deposits, and withdrawals.",
            "Customer support via email, in-app messaging, and documented dispute resolution.",
          ],
        },
      ],
    },
    {
      heading: "3. Payment Processing",
      subsections: [
        {
          paragraphs: [
            "Payment processing is handled through PaymentEngine™, a provider-agnostic orchestration layer. Card-present and card-not-present transactions are tokenized at the processor; SquareBoards does not store primary account numbers.",
          ],
          bullets: [
            "Deposits: Customer-initiated funding of SquareWallet via approved payment methods.",
            "Contest entries: Internal ledger debits against wallet balance or direct charge at checkout.",
            "Payouts: Winner distributions via approved payout rails (ACH, instant payout where available).",
            "Reconciliation: Daily settlement matching between processor reports and internal ledger.",
            "Refunds: Governed by published Refund Policy with audit trail on all reversals.",
          ],
        },
      ],
    },
    {
      heading: "4. Compliance and Governance",
      subsections: [
        {
          bullets: [
            "Published Terms of Service, Privacy Policy, Official Contest Rules, and Fair Play Policy.",
            "Identity verification (KYC) required before first withdrawal and on risk triggers.",
            "Fraud monitoring, velocity checks, and device fingerprinting on sensitive actions.",
            "Responsible competition tools including deposit limits and self-exclusion options.",
            "Admin audit logging on all financial and account-status changes.",
            "Regulatory inquiry channel: legal@squareboards.pro",
          ],
        },
      ],
    },
    {
      heading: "5. Customer Support and Disputes",
      subsections: [
        {
          paragraphs: [
            "Support is available at support@squareboards.pro. Disputes related to contest outcomes follow published Official Contest Rules. Payment disputes are investigated with processor chargeback data and internal transaction records. Response targets: acknowledgment within one business day; resolution within five business days for standard inquiries.",
          ],
        },
      ],
    },
    {
      heading: "6. Key Metrics for Underwriting",
      subsections: [
        {
          bullets: [
            "Average transaction size: contest entry fees typically $5–$50 per transaction.",
            "Chargeback target: maintained below industry benchmarks through clear contest rules and proactive support.",
            "No high-risk MCC gambling classification — skill-based contest model.",
            "Seasonal volume patterns aligned with major U.S. sports calendars.",
          ],
        },
      ],
    },
  ],
  footerNote:
    "Document ID: ALD-MER-001 | Classification: Merchant Underwriting | Last Updated: June 2026 | Contact: legal@squareboards.pro",
};
