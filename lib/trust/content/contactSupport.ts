import type { PolicyDocument } from "../types";

export const contactSupportPolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Support Center",
      subsections: [
        {
          paragraphs: [
            "The fastest way to get help is through our Support Center at squareboards.pro/support. Sign in to use the Message Center for tracked conversations about payments, gameplay, and technical issues.",
          ],
          bullets: [
            "Message Center: /support/messages (sign-in required)",
            "Report a Problem: /support/report",
            "Help articles: /support/help-center",
          ],
        },
      ],
    },
    {
      heading: "2. Email Contacts",
      subsections: [
        {
          bullets: [
            "General support: support@squareboards.pro",
            "Legal notices: legal@squareboards.pro",
            "Privacy requests: privacy@squareboards.pro",
            "Security reports: security@squareboards.pro",
            "Compliance inquiries: compliance@squareboards.pro",
          ],
        },
      ],
    },
    {
      heading: "3. Response Times",
      subsections: [
        {
          paragraphs: [
            "We aim to acknowledge support requests within one business day. Complex payment, fraud, or verification cases may require additional investigation. Urgent security issues receive priority handling.",
          ],
        },
      ],
    },
    {
      heading: "4. Legal and Regulatory Inquiries",
      subsections: [
        {
          paragraphs: [
            "Attorneys, regulators, and law enforcement may contact legal@squareboards.pro with credentials and a detailed request. We respond to valid legal process in accordance with applicable law.",
          ],
          bullets: [
            "Company: ALTIVORA LABS LLC",
            "Website: www.squareboards.pro",
          ],
        },
      ],
    },
    {
      heading: "5. Partners and Press",
      subsections: [
        {
          paragraphs: [
            "Business development and partnership inquiries: support@squareboards.pro with subject line \"Partnership.\" Media requests: include \"Press\" in the subject line.",
          ],
        },
      ],
    },
    {
      heading: "6. Transparency Resources",
      subsections: [
        {
          paragraphs: [
            "For platform economics and automation details, visit the Transparency Center at /transparency. For all policies, remain in this Trust Center hub.",
          ],
        },
      ],
    },
  ],
};
