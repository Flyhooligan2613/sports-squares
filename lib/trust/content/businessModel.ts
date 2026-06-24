import type { PolicyDocument } from "../types";

export const businessModel: PolicyDocument = {
  sections: [
    {
      heading: "Document ALD-BUS-001 — Business Model",
      subsections: [
        {
          paragraphs: [
            "This document describes the end-to-end payment flow, revenue model, and fund movement lifecycle on the SquareBoards platform for payment processor underwriting and banking partner review.",
          ],
        },
      ],
    },
    {
      heading: "1. Revenue Model",
      subsections: [
        {
          bullets: [
            "Contest entry fees: Primary revenue from customer participation in skill-based contests.",
            "Platform service fee: Percentage or flat fee on contest pools as disclosed at entry.",
            "SquarePass™ membership: Optional premium subscription for enhanced platform features.",
            "No spread-based wagering revenue — the platform does not take positions against customers.",
          ],
        },
      ],
    },
    {
      heading: "2. Customer Registration and Funding",
      subsections: [
        {
          numbered: [
            "Customer creates account and accepts Terms of Service and Official Contest Rules.",
            "Age and jurisdiction eligibility verified at registration.",
            "Customer initiates deposit via PaymentEngine™ to approved payment processor.",
            "Processor authorizes and captures payment; webhook confirms settlement.",
            "SquareBank™ posts credit to customer SquareWallet™ ledger account.",
            "Customer receives confirmation and updated wallet balance.",
          ],
        },
      ],
    },
    {
      heading: "3. Contest Entry Flow",
      subsections: [
        {
          paragraphs: [
            "When a customer joins a contest, the entry fee is either debited from their SquareWallet balance or charged directly at checkout if wallet balance is insufficient.",
          ],
          bullets: [
            "Entry fee amount and total pool structure displayed before confirmation.",
            "Ledger debit recorded in SquareBank with contest ID, customer ID, and timestamp.",
            "Contest pool aggregate updated; entry confirmed with receipt.",
            "Entries may be refunded per Refund Policy if contest is cancelled before start.",
            "No entry permitted in restricted jurisdictions or for ineligible accounts.",
          ],
        },
      ],
    },
    {
      heading: "4. Payment Processing and Settlement",
      subsections: [
        {
          bullets: [
            "Card transactions processed through PCI-compliant payment provider with tokenization.",
            "Settlement batches reconciled daily against processor settlement reports.",
            "Internal ledger balances must reconcile to processor net settlement within defined tolerance.",
            "Failed payments do not credit wallet; partial captures handled per processor rules.",
            "Platform operating account receives net platform fees per configured fee schedule.",
          ],
        },
      ],
    },
    {
      heading: "5. Prize Distribution",
      subsections: [
        {
          paragraphs: [
            "Upon contest completion, winners are determined by published scoring rules. Prize amounts are calculated from the contest pool minus disclosed platform fees.",
          ],
          numbered: [
            "Contest engine finalizes scores and identifies winning positions.",
            "SquareBank posts prize credits to winner SquareWallet accounts.",
            "Winners notified via in-app notification and optional email.",
            "Prize funds remain in wallet until customer initiates withdrawal.",
            "Withdrawals require completed KYC verification.",
          ],
        },
      ],
    },
    {
      heading: "6. Reconciliation and Reporting",
      subsections: [
        {
          bullets: [
            "Daily reconciliation: processor settlements vs. SquareBank ledger totals.",
            "Contest pool reconciliation: entries in vs. prizes out per contest ID.",
            "Chargeback tracking: linked to original transaction and customer account.",
            "Admin financial dashboard for real-time platform metrics and anomaly detection.",
            "Monthly financial summaries available for audit and partner review upon request.",
          ],
        },
      ],
    },
    {
      heading: "7. Refunds and Reversals",
      subsections: [
        {
          paragraphs: [
            "Refunds are issued per the published Refund Policy. Contest cancellations before start trigger automatic entry refunds to wallet or original payment method. Chargebacks are investigated with full transaction history and contest participation records provided to the processor.",
          ],
        },
      ],
    },
  ],
  footerNote:
    "Document ID: ALD-BUS-001 | Classification: Payment Flow Documentation | Last Updated: June 2026 | Contact: legal@squareboards.pro",
};
