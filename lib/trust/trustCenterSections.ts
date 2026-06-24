import type { TrustCenterSection } from "./types";

const TRUST_BASE = "/trust";

export const TRUST_CENTER_SECTIONS: TrustCenterSection[] = [
  {
    slug: "terms-of-service",
    icon: "📄",
    title: "Terms of Service",
    description: "Platform rules, eligibility, accounts, and your agreement with SquareBoards.",
    route: `${TRUST_BASE}/terms-of-service`,
  },
  {
    slug: "privacy-policy",
    icon: "🔒",
    title: "Privacy Policy",
    description: "How we collect, use, store, and protect your personal information.",
    route: `${TRUST_BASE}/privacy-policy`,
  },
  {
    slug: "refund-policy",
    icon: "💵",
    title: "Refund Policy",
    description: "When refunds apply to entries, credits, and contest participation.",
    route: `${TRUST_BASE}/refund-policy`,
  },
  {
    slug: "official-contest-rules",
    icon: "🏆",
    title: "Official Contest Rules",
    description: "How SquareBoards contests operate, score, pay out, and resolve disputes.",
    route: `${TRUST_BASE}/official-contest-rules`,
  },
  {
    slug: "responsible-competition",
    icon: "🛡",
    title: "Responsible Competition",
    description: "Healthy play habits, limits, and resources for competitors.",
    route: `${TRUST_BASE}/responsible-competition`,
  },
  {
    slug: "fair-play-policy",
    icon: "⚖",
    title: "Fair Play Policy",
    description: "Standards for integrity, automation, and equal treatment on the platform.",
    route: `${TRUST_BASE}/fair-play-policy`,
  },
  {
    slug: "identity-verification",
    icon: "👤",
    title: "Identity Verification (KYC)",
    description: "When and how we verify identity for payouts and account security.",
    route: `${TRUST_BASE}/identity-verification`,
  },
  {
    slug: "fraud-prevention",
    icon: "🚨",
    title: "Fraud Prevention",
    description: "How we detect, investigate, and respond to abusive or fraudulent activity.",
    route: `${TRUST_BASE}/fraud-prevention`,
  },
  {
    slug: "security",
    icon: "🔐",
    title: "Security",
    description: "Infrastructure, encryption, access controls, and incident response.",
    route: `${TRUST_BASE}/security`,
  },
  {
    slug: "cookie-policy",
    icon: "🍪",
    title: "Cookie Policy",
    description: "Cookies, local storage, and similar technologies on SquareBoards.",
    route: `${TRUST_BASE}/cookie-policy`,
  },
  {
    slug: "community-guidelines",
    icon: "🤝",
    title: "Community Guidelines",
    description: "Expected conduct, respect, and enforcement across the community.",
    route: `${TRUST_BASE}/community-guidelines`,
  },
  {
    slug: "contact-support",
    icon: "📞",
    title: "Contact & Support",
    description: "How to reach SquareBoards for help, legal notices, and regulatory inquiries.",
    route: `${TRUST_BASE}/contact-support`,
  },
];

export function getTrustSectionBySlug(slug: string): TrustCenterSection | undefined {
  return TRUST_CENTER_SECTIONS.find((section) => section.slug === slug);
}

export function getTrustSectionSlugs(): string[] {
  return TRUST_CENTER_SECTIONS.map((section) => section.slug);
}
