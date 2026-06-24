import type { PolicyDocument } from "../types";

export const securityPolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Security Commitment",
      subsections: [
        {
          paragraphs: [
            "Protecting competitor data, contest integrity, and financial operations is core to SquareBoards. We combine infrastructure hardening, secure development practices, and continuous monitoring.",
          ],
        },
      ],
    },
    {
      heading: "2. Infrastructure",
      subsections: [
        {
          bullets: [
            "Hosted on modern cloud infrastructure with encryption in transit (TLS 1.2+).",
            "Database access restricted by role; production data segregated from development.",
            "Secrets managed through environment configuration — not committed to source control.",
            "Regular dependency updates and vulnerability patching.",
          ],
        },
      ],
    },
    {
      heading: "3. Application Security",
      subsections: [
        {
          bullets: [
            "Authentication through industry-standard session and token practices.",
            "Row-level security and server-side authorization on sensitive operations.",
            "All SquareBank™ balance changes through controlled ledger posting — no direct balance edits.",
            "Admin actions logged in audit trails with least-privilege access.",
            "Rate limiting and abuse protection on public APIs.",
          ],
        },
      ],
    },
    {
      heading: "4. Payments",
      subsections: [
        {
          paragraphs: [
            "Card data is handled entirely by Stripe; SquareBoards does not store full card numbers. Payouts flow through Stripe Connect and SquareWallet™ with partner-grade PCI controls.",
          ],
        },
      ],
    },
    {
      heading: "5. Monitoring and Incident Response",
      subsections: [
        {
          bullets: [
            "Automated alerting on errors, anomalies, and security events.",
            "Documented incident response procedures including containment and notification.",
            "Post-incident review to improve controls and communication.",
          ],
          paragraphs: [
            "Where law requires, we will notify affected users of breaches involving personal data.",
          ],
        },
      ],
    },
    {
      heading: "6. Your Role",
      subsections: [
        {
          bullets: [
            "Use a unique, strong password and enable available security features.",
            "Do not share credentials or verification codes.",
            "Sign out on shared devices.",
            "Report suspicious login or payout activity immediately.",
          ],
        },
      ],
    },
    {
      heading: "7. Responsible Disclosure",
      subsections: [
        {
          paragraphs: [
            "Security researchers may report vulnerabilities to security@squareboards.pro. Please allow reasonable time for remediation before public disclosure. We do not support unauthorized testing against production competitor accounts.",
          ],
        },
      ],
    },
  ],
};
