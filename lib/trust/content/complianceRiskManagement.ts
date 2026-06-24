import type { PolicyDocument } from "../types";

export const complianceRiskManagement: PolicyDocument = {
  sections: [
    {
      heading: "Document ALD-CMP-001 — Compliance & Risk Management",
      subsections: [
        {
          paragraphs: [
            "This document outlines the enterprise compliance program, operational risk controls, and customer protection framework maintained by ALTIVORA LABS LLC for the SquareBoards platform.",
          ],
        },
      ],
    },
    {
      heading: "1. Compliance Program Overview",
      subsections: [
        {
          paragraphs: [
            "SquareBoards maintains a documented compliance program covering regulatory requirements, internal policies, employee training, and periodic review. The program is designed to meet the expectations of payment processors, banking partners, and state-level contest regulations.",
          ],
          bullets: [
            "Designated compliance oversight with executive accountability.",
            "Published policies accessible via the public Trust Center.",
            "Annual policy review cycle with version control and change logs.",
            "Regulatory monitoring for changes in skill-contest and payment regulations.",
          ],
        },
      ],
    },
    {
      heading: "2. Operational Controls",
      subsections: [
        {
          bullets: [
            "Segregation of duties: financial operations require multi-step authorization.",
            "SquareBank ledger: all balance changes through controlled posting functions — no manual edits.",
            "Role-based admin access with least-privilege and session logging.",
            "Change management for production deployments with rollback capability.",
            "Environment segregation: production data isolated from development and staging.",
          ],
        },
      ],
    },
    {
      heading: "3. Fraud Monitoring",
      subsections: [
        {
          paragraphs: [
            "A multi-layered fraud prevention program monitors account creation, deposits, contest entries, and withdrawals for anomalous patterns.",
          ],
          bullets: [
            "Velocity checks on deposits, entries, and withdrawal requests.",
            "Device fingerprinting and IP geolocation on sensitive actions.",
            "Duplicate account detection via identity signals and behavioral analysis.",
            "Automated holds on accounts triggering high-risk score thresholds.",
            "Manual review queue for flagged transactions before payout release.",
            "Coordinated response with payment processor fraud tools and chargeback alerts.",
          ],
        },
      ],
    },
    {
      heading: "4. Customer Protection",
      subsections: [
        {
          bullets: [
            "Clear disclosure of contest rules, fees, and payout structures before entry.",
            "Identity verification (KYC) required before first withdrawal.",
            "Responsible competition tools: deposit limits, cooling-off periods, self-exclusion.",
            "Encrypted data in transit (TLS 1.2+) and at rest for sensitive records.",
            "Privacy Policy governing collection, use, and retention of personal data.",
            "Prompt notification procedures for security incidents affecting personal data.",
          ],
        },
      ],
    },
    {
      heading: "5. Dispute Management",
      subsections: [
        {
          numbered: [
            "Customer submits dispute via support channel or processor chargeback notification.",
            "Support team acknowledges within one business day and assigns case ID.",
            "Internal investigation: transaction history, contest records, communication logs.",
            "Resolution communicated to customer with documented rationale.",
            "Processor chargeback responses submitted with supporting evidence within required timelines.",
            "Escalation path to legal@squareboards.pro for unresolved or regulatory matters.",
          ],
        },
      ],
    },
    {
      heading: "6. Risk Governance",
      subsections: [
        {
          bullets: [
            "Risk register maintained for operational, financial, regulatory, and reputational risks.",
            "Quarterly risk review with mitigation status tracking.",
            "Incident response plan with defined roles, communication templates, and post-incident review.",
            "Business continuity planning for critical platform and payment functions.",
            "Third-party vendor risk assessment for payment, identity, and infrastructure providers.",
          ],
        },
      ],
    },
    {
      heading: "7. Audit and Reporting",
      subsections: [
        {
          paragraphs: [
            "SquareBoards maintains comprehensive audit trails on all financial transactions, admin actions, and policy changes. Audit logs are retained per data retention policy and available for review by authorized partners, regulators, and auditors upon formal request to legal@squareboards.pro.",
          ],
        },
      ],
    },
  ],
  footerNote:
    "Document ID: ALD-CMP-001 | Classification: Compliance & Risk | Last Updated: June 2026 | Contact: legal@squareboards.pro",
};
