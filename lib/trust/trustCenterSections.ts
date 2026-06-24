import type { TrustCenterCategory, TrustCenterSection } from "./types";

const TRUST_BASE = "/trust";

export const TRUST_CENTER_CATEGORIES: TrustCenterCategory[] = [
  { id: "policies", title: "Policies", lucideIcon: "FileText" },
  { id: "competition", title: "Competition", lucideIcon: "Trophy" },
  { id: "security", title: "Security", lucideIcon: "Lock" },
  { id: "support", title: "Support", lucideIcon: "HeartHandshake" },
];

export const TRUST_CENTER_SECTIONS: TrustCenterSection[] = [
  {
    slug: "terms-of-service",
    lucideIcon: "FileText",
    title: "Terms of Service",
    description: "Platform rules, eligibility, accounts, and your agreement with SquareBoards.",
    route: `${TRUST_BASE}/terms-of-service`,
    status: "current",
    categoryId: "policies",
  },
  {
    slug: "privacy-policy",
    lucideIcon: "Shield",
    title: "Privacy Policy",
    description: "How we collect, use, store, and protect your personal information.",
    route: `${TRUST_BASE}/privacy-policy`,
    status: "updated",
    categoryId: "policies",
  },
  {
    slug: "refund-policy",
    lucideIcon: "Scale",
    title: "Refund Policy",
    description: "When refunds apply to entries, credits, and contest participation.",
    route: `${TRUST_BASE}/refund-policy`,
    status: "current",
    categoryId: "policies",
  },
  {
    slug: "cookie-policy",
    lucideIcon: "Cookie",
    title: "Cookie Policy",
    description: "Cookies, local storage, and similar technologies on SquareBoards.",
    route: `${TRUST_BASE}/cookie-policy`,
    status: "current",
    categoryId: "policies",
  },
  {
    slug: "official-contest-rules",
    lucideIcon: "Trophy",
    title: "Official Contest Rules",
    description: "How SquareBoards contests operate, score, pay out, and resolve disputes.",
    route: `${TRUST_BASE}/official-contest-rules`,
    status: "current",
    categoryId: "competition",
  },
  {
    slug: "responsible-competition",
    lucideIcon: "ShieldCheck",
    title: "Responsible Competition",
    description: "Healthy play habits, limits, and resources for competitors.",
    route: `${TRUST_BASE}/responsible-competition`,
    status: "active",
    categoryId: "competition",
  },
  {
    slug: "fair-play-policy",
    lucideIcon: "Scale",
    title: "Fair Play Policy",
    description: "Standards for integrity, automation, and equal treatment on the platform.",
    route: `${TRUST_BASE}/fair-play-policy`,
    status: "active",
    categoryId: "competition",
  },
  {
    slug: "identity-verification",
    lucideIcon: "UserCheck",
    title: "Identity Verification (KYC)",
    description: "When and how we verify identity for payouts and account security.",
    route: `${TRUST_BASE}/identity-verification`,
    status: "active",
    categoryId: "security",
  },
  {
    slug: "fraud-prevention",
    lucideIcon: "AlertTriangle",
    title: "Fraud Prevention",
    description: "How we detect, investigate, and respond to abusive or fraudulent activity.",
    route: `${TRUST_BASE}/fraud-prevention`,
    status: "active",
    categoryId: "security",
  },
  {
    slug: "security",
    lucideIcon: "Lock",
    title: "Security",
    description: "Infrastructure, encryption, access controls, and incident response.",
    route: `${TRUST_BASE}/security`,
    status: "updated",
    categoryId: "security",
  },
  {
    slug: "community-guidelines",
    lucideIcon: "Users",
    title: "Community Guidelines",
    description: "Expected conduct, respect, and enforcement across the community.",
    route: `${TRUST_BASE}/community-guidelines`,
    status: "active",
    categoryId: "support",
  },
  {
    slug: "contact-support",
    lucideIcon: "Mail",
    title: "Contact & Support",
    description: "How to reach SquareBoards for help, legal notices, and regulatory inquiries.",
    route: `${TRUST_BASE}/contact-support`,
    status: "active",
    categoryId: "support",
  },
];

export function getTrustSectionBySlug(slug: string): TrustCenterSection | undefined {
  return TRUST_CENTER_SECTIONS.find((section) => section.slug === slug);
}

export function getTrustSectionSlugs(): string[] {
  return TRUST_CENTER_SECTIONS.map((section) => section.slug);
}

export function getTrustSectionsByCategory(categoryId: TrustCenterCategory["id"]): TrustCenterSection[] {
  return TRUST_CENTER_SECTIONS.filter((section) => section.categoryId === categoryId);
}
