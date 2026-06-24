import type { PolicyDocument } from "../types";

export const termsOfServicePolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Agreement to Terms",
      subsections: [
        {
          paragraphs: [
            "These Terms of Service (\"Terms\") govern your access to and use of SquareBoards, SquareBank™, SquareWallet™, and related services (collectively, the \"Platform\") operated by ALTIVORA LABS LLC (\"SquareBoards,\" \"we,\" \"us,\" or \"our\").",
            "By creating an account, joining a contest, or otherwise using the Platform, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Platform.",
          ],
        },
      ],
    },
    {
      heading: "2. Eligibility",
      subsections: [
        {
          bullets: [
            "You must be at least 18 years old (or the age of majority in your jurisdiction, whichever is higher).",
            "You must be legally permitted to participate in skill-based contests and prize competitions where you live.",
            "You may not use the Platform if you are located in a jurisdiction where our services are prohibited.",
            "One person may maintain only one active competitor account unless we expressly authorize otherwise.",
          ],
        },
      ],
    },
    {
      heading: "3. Nature of the Platform",
      subsections: [
        {
          paragraphs: [
            "SquareBoards is a competitive sports platform — not a sportsbook and not gambling against the house. Contests are hosted among competitors with published rules, official scoring feeds, and automated settlement.",
          ],
          bullets: [
            "Pick'em and similar formats are skill competitions among participants.",
            "Squares contests use randomized digit assignments and official game scores.",
            "SquareBoards does not take the other side of your picks or guarantee outcomes.",
          ],
        },
      ],
    },
    {
      heading: "4. Accounts and Security",
      subsections: [
        {
          paragraphs: [
            "You are responsible for safeguarding your login credentials and for all activity under your account. Notify us promptly at support@squareboards.pro if you suspect unauthorized access.",
          ],
          bullets: [
            "Provide accurate registration information and keep it current.",
            "Do not share, sell, or transfer your account.",
            "We may require identity verification before payouts or after risk signals.",
          ],
        },
      ],
    },
    {
      heading: "5. Entries, Fees, and Payouts",
      subsections: [
        {
          paragraphs: [
            "Contest entry fees, hosting fees, and prize pool allocations are disclosed before you join. Payments are processed by Stripe; payout accounts are managed through SquareWallet™.",
          ],
          bullets: [
            "Winners receive automated payouts when contests complete and payout setup is verified.",
            "SquareBoards does not issue discretionary manual payouts to alter contest outcomes.",
            "Refunds are governed by our Refund Policy.",
          ],
        },
      ],
    },
    {
      heading: "6. Acceptable Use",
      subsections: [
        {
          paragraphs: ["You agree not to:"],
          bullets: [
            "Violate applicable laws or third-party rights.",
            "Use bots, scripts, collusion, or multi-accounting to gain unfair advantage.",
            "Interfere with Platform operations, scoring systems, or security controls.",
            "Harass other competitors or submit fraudulent payment information.",
            "Reverse engineer, scrape, or misuse Platform APIs except as permitted.",
          ],
        },
      ],
    },
    {
      heading: "7. Intellectual Property",
      subsections: [
        {
          paragraphs: [
            "SquareBoards, its logos, software, and content are owned by ALTIVORA LABS LLC or its licensors. You receive a limited, revocable license to use the Platform for personal, non-commercial competition.",
          ],
        },
      ],
    },
    {
      heading: "8. Disclaimers",
      subsections: [
        {
          paragraphs: [
            "The Platform is provided \"as is\" and \"as available.\" We do not warrant uninterrupted service, error-free scoring feeds, or specific contest availability. Official league data may be delayed or corrected by providers.",
          ],
        },
      ],
    },
    {
      heading: "9. Limitation of Liability",
      subsections: [
        {
          paragraphs: [
            "To the maximum extent permitted by law, SquareBoards and ALTIVORA LABS LLC are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our aggregate liability for any claim relating to the Platform is limited to the greater of (a) amounts you paid to SquareBoards in the twelve months before the claim or (b) one hundred U.S. dollars.",
          ],
        },
      ],
    },
    {
      heading: "10. Dispute Resolution",
      subsections: [
        {
          paragraphs: [
            "Contest outcomes are determined by published rules and automated systems. For account, payment, or policy disputes, contact support@squareboards.pro. Where required by law, you may have rights to pursue remedies in your local courts.",
          ],
        },
      ],
    },
    {
      heading: "11. Changes and Termination",
      subsections: [
        {
          paragraphs: [
            "We may update these Terms by posting a revised version in the Trust Center. Material changes will be noted with an updated date. Continued use after changes constitutes acceptance. We may suspend or terminate accounts that violate these Terms or pose risk to the community.",
          ],
        },
      ],
    },
    {
      heading: "12. Contact",
      subsections: [
        {
          paragraphs: [
            "ALTIVORA LABS LLC · legal@squareboards.pro · www.squareboards.pro",
          ],
        },
      ],
    },
  ],
};
