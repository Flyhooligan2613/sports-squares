import type { PolicyDocument } from "../types";

export const privacyPolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Overview",
      subsections: [
        {
          paragraphs: [
            "ALTIVORA LABS LLC (\"SquareBoards\") respects your privacy. This Privacy Policy explains what information we collect, how we use it, who we share it with, and the choices available to you when you use SquareBoards, SquareWallet™, and related services.",
          ],
        },
      ],
    },
    {
      heading: "2. Information We Collect",
      subsections: [
        {
          heading: "Information you provide",
          bullets: [
            "Account details: name, email, phone number, username, and profile information.",
            "Contest activity: entries, picks, purchases, winnings, and support messages.",
            "Payment and payout data: processed by Stripe; we do not store full card numbers.",
            "Identity verification documents when required for KYC or fraud review.",
          ],
        },
        {
          heading: "Information collected automatically",
          bullets: [
            "Device and browser type, IP address, and general location (city/region).",
            "Usage logs, session data, and performance diagnostics.",
            "Cookies and local storage used for authentication and preferences (see Cookie Policy).",
          ],
        },
      ],
    },
    {
      heading: "3. How We Use Information",
      subsections: [
        {
          bullets: [
            "Operate contests, score results, and process entries and payouts.",
            "Authenticate accounts, prevent fraud, and enforce policies.",
            "Provide customer support and communicate about your activity.",
            "Improve Platform performance, security, and product features.",
            "Comply with legal obligations and respond to lawful requests.",
          ],
        },
      ],
    },
    {
      heading: "4. How We Share Information",
      subsections: [
        {
          paragraphs: ["We do not sell your personal information. We share data only as needed:"],
          bullets: [
            "Payment processors (Stripe) for transactions and SquareWallet™ payouts.",
            "Infrastructure providers (e.g., Supabase, hosting, email) under contractual safeguards.",
            "Identity verification partners when KYC is required.",
            "Authorities when required by law or to protect rights, safety, and Platform integrity.",
            "Business transfers if SquareBoards undergoes a merger, acquisition, or asset sale.",
          ],
        },
      ],
    },
    {
      heading: "5. Data Retention",
      subsections: [
        {
          paragraphs: [
            "We retain information for as long as your account is active and as needed to provide services, resolve disputes, enforce agreements, and meet legal requirements. Financial and contest records may be retained longer where required for compliance.",
          ],
        },
      ],
    },
    {
      heading: "6. Security",
      subsections: [
        {
          paragraphs: [
            "We use encryption in transit, access controls, and monitoring designed to protect personal data. No method of transmission or storage is completely secure; see our Security policy for more detail.",
          ],
        },
      ],
    },
    {
      heading: "7. Your Rights and Choices",
      subsections: [
        {
          bullets: [
            "Access, correct, or update profile information in your account settings.",
            "Request deletion of your account data where applicable law allows.",
            "Opt out of non-essential marketing emails via unsubscribe links.",
            "Manage cookies through browser settings and our Cookie Policy.",
          ],
          paragraphs: [
            "Depending on your location, you may have additional rights under GDPR, CCPA, or similar laws. Contact privacy@squareboards.pro to submit a request.",
          ],
        },
      ],
    },
    {
      heading: "8. Children's Privacy",
      subsections: [
        {
          paragraphs: [
            "SquareBoards is not directed to individuals under 18. We do not knowingly collect personal information from children. Contact us if you believe a minor has provided data.",
          ],
        },
      ],
    },
    {
      heading: "9. International Users",
      subsections: [
        {
          paragraphs: [
            "SquareBoards is operated from the United States. If you access the Platform from other regions, your information may be processed in the U.S. and other countries where our providers operate.",
          ],
        },
      ],
    },
    {
      heading: "10. Changes and Contact",
      subsections: [
        {
          paragraphs: [
            "We may update this Privacy Policy in the Trust Center. Material changes will be reflected in the \"Last Updated\" date.",
            "ALTIVORA LABS LLC · privacy@squareboards.pro · www.squareboards.pro",
          ],
        },
      ],
    },
  ],
};
