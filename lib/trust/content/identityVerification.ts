import type { PolicyDocument } from "../types";

export const identityVerificationPolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Why We Verify Identity",
      subsections: [
        {
          paragraphs: [
            "SquareBoards uses identity verification (Know Your Customer / KYC) to protect competitors, prevent fraud, and comply with financial regulations governing payouts through SquareWallet™ and Stripe.",
          ],
        },
      ],
    },
    {
      heading: "2. When Verification Is Required",
      subsections: [
        {
          bullets: [
            "Before your first cash-out or when cumulative winnings exceed published thresholds.",
            "When Stripe or SquareBoards requests updated verification for Connect accounts.",
            "After suspicious activity, chargebacks, or multi-account signals.",
            "When required by law in your jurisdiction.",
          ],
        },
      ],
    },
    {
      heading: "3. Information We May Request",
      subsections: [
        {
          bullets: [
            "Legal name, date of birth, and residential address.",
            "Government-issued photo ID (driver's license, passport, or national ID).",
            "Selfie or liveness check to match your ID.",
            "Tax identification where required for reporting thresholds.",
            "Proof of address for certain high-value or high-risk reviews.",
          ],
        },
      ],
    },
    {
      heading: "4. How Verification Works",
      subsections: [
        {
          numbered: [
            "You initiate or respond to a verification prompt in My Games or SquareWallet™ settings.",
            "Documents are submitted through Stripe Identity or approved verification partners.",
            "Automated and manual review typically completes within minutes to a few business days.",
            "You receive notification when approved, or with instructions if additional steps are needed.",
          ],
        },
      ],
    },
    {
      heading: "5. Data Handling",
      subsections: [
        {
          paragraphs: [
            "Verification documents are processed by regulated partners under strict confidentiality. SquareBoards retains only what is necessary for compliance and fraud prevention, as described in our Privacy Policy.",
          ],
        },
      ],
    },
    {
      heading: "6. Failed or Rejected Verification",
      subsections: [
        {
          bullets: [
            "Blurry, expired, or mismatched documents may be rejected with resubmission allowed.",
            "Confirmed identity fraud results in permanent account closure.",
            "Payouts remain paused until verification succeeds or the account is closed per policy.",
          ],
        },
      ],
    },
    {
      heading: "7. Contact",
      subsections: [
        {
          paragraphs: [
            "Questions about verification status: support@squareboards.pro",
          ],
        },
      ],
    },
  ],
};
