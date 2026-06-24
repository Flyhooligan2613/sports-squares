import type { PolicyDocument } from "../types";

export const refundPolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Policy Overview",
      subsections: [
        {
          paragraphs: [
            "SquareBoards processes contest entries through SquareWallet™ and Stripe. Because contests involve pooled entries and automated settlement, refunds are limited to the circumstances described below.",
          ],
        },
      ],
    },
    {
      heading: "2. When Refunds May Apply",
      subsections: [
        {
          bullets: [
            "Contest cancellation before lock: if SquareBoards cancels a contest before entries lock, eligible entry fees are refunded to the original payment method or SquareWallet™ balance.",
            "Failed or voided contests: when a game is officially cancelled or voided and no valid result can be determined under published rules.",
            "Duplicate charges: verified duplicate transactions caused by a Platform error.",
            "Unauthorized transactions: after investigation confirms fraud not attributable to account holder negligence.",
          ],
        },
      ],
    },
    {
      heading: "3. When Refunds Do Not Apply",
      subsections: [
        {
          bullets: [
            "Completed contests with official results and automated payouts.",
            "Entries locked at kickoff, tip-off, or published lock time.",
            "User error, including incorrect picks or purchases on the wrong contest.",
            "Chargebacks filed without first contacting SquareBoards support.",
            "Promotional credits, bonus SquareWallet™ balances, or non-cash rewards unless expressly stated.",
          ],
        },
      ],
    },
    {
      heading: "4. Partial Refunds and Credits",
      subsections: [
        {
          paragraphs: [
            "In rare operational situations — such as partial board fills that do not meet guaranteed-play thresholds — SquareBoards may refund unallocated entries or issue SquareWallet™ credits according to contest-specific rules displayed at entry.",
          ],
        },
      ],
    },
    {
      heading: "5. Processing Time",
      subsections: [
        {
          bullets: [
            "SquareWallet™ credits: typically immediate after approval.",
            "Card refunds: usually 5–10 business days depending on your bank.",
            "Stripe payout reversals: governed by Stripe and financial partner timelines.",
          ],
        },
      ],
    },
    {
      heading: "6. How to Request a Refund",
      subsections: [
        {
          numbered: [
            "Sign in and open the Support Center or Message Center.",
            "Select Payments & Refunds and include contest ID, transaction date, and amount.",
            "Our team reviews requests against contest status, lock times, and SquareBank™ ledger records.",
          ],
          paragraphs: [
            "Email support@squareboards.pro with the same details if you cannot access your account.",
          ],
        },
      ],
    },
    {
      heading: "7. Chargebacks",
      subsections: [
        {
          paragraphs: [
            "Filing a chargeback without contacting us may result in account suspension while the dispute is investigated. We provide transaction records to payment partners to document legitimate contest participation.",
          ],
        },
      ],
    },
  ],
};
