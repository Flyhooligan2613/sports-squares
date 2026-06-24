import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Scale,
  Fingerprint,
  Wallet,
  ShieldCheck,
  MapPin,
  Trophy,
  Zap,
  Users,
  Bell,
  Activity,
  UserCircle,
  Medal,
  Gift,
  LayoutGrid,
  Lock,
  FileCheck,
  Building2,
  Smartphone,
  Eye,
  HeartHandshake,
  Clock,
  Globe,
} from "lucide-react";

export const HERO_COPY = {
  headline: "The Ultimate Multi-Game Platform",
  supporting:
    "SquareBoards unites fair competition, secure payments, and live sports experiences in one premium platform — engineered for competitors and trusted by partners.",
  primaryCta: "Download App",
  secondaryCta: "Learn More",
  howItWorksLink: "See How It Works",
} as const;

export const TRUST_STRIP_ITEMS: { label: string; icon: LucideIcon }[] = [
  { label: "Secure Platform", icon: Shield },
  { label: "Fair Competition", icon: Scale },
  { label: "Identity Verification", icon: Fingerprint },
  { label: "Secure Wallet", icon: Wallet },
  { label: "Fraud Protection", icon: ShieldCheck },
  { label: "Florida Company", icon: MapPin },
];

export const WHY_SQUAREBOARDS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Fair Competition",
    description:
      "Peer-to-peer contests with transparent rules, official score sync, and automated payouts — never gambling against the house.",
    icon: Scale,
  },
  {
    title: "Secure Platform",
    description:
      "Enterprise-grade infrastructure, encrypted payments, and continuous fraud monitoring protect every account and transaction.",
    icon: Shield,
  },
  {
    title: "Fast & Secure Wallet",
    description:
      "Fund, compete, and withdraw through SquareWallet™ — powered by Stripe with instant balance visibility and secure checkout.",
    icon: Wallet,
  },
];

export const HOW_IT_WORKS_STEPS = [
  { title: "Create Account", description: "One profile unlocks every game and feature on the platform." },
  { title: "Verify Identity", description: "Complete KYC when required for payouts and account security." },
  { title: "Fund Wallet", description: "Add funds securely through SquareWallet™ with Stripe checkout." },
  { title: "Choose Contest", description: "Browse live pools across NFL, NBA, MLB, NCAA, and more." },
  { title: "Select Squares", description: "Claim your squares on the board before kickoff or tip-off." },
  { title: "Watch Live Games", description: "Track scores, quarter winners, and live activity in real time." },
  { title: "Win", description: "Automatic winner detection and transparent payout calculations." },
  { title: "Withdraw", description: "Fast, secure withdrawals to your verified payout method." },
];

export const SUPPORTED_SPORTS: { name: string; description: string; icon: LucideIcon; status?: "live" | "future" }[] = [
  { name: "NFL", description: "Pro football squares for every game.", icon: Trophy, status: "live" },
  { name: "NBA", description: "Basketball boards with quarter winners.", icon: Trophy, status: "live" },
  { name: "MLB", description: "Inning-based squares with daily boards.", icon: Trophy, status: "live" },
  { name: "NCAA Football", description: "College football boards all season.", icon: Trophy, status: "live" },
  { name: "NCAA Basketball", description: "March Madness and regular season hoops.", icon: Trophy, status: "live" },
  { name: "Soccer", description: "Global football contests coming soon.", icon: Globe, status: "future" },
  { name: "Future Sports", description: "New leagues and game modes on the roadmap.", icon: Zap, status: "future" },
];

export const PLATFORM_FEATURES: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Wallet", description: "SquareWallet™ — secure funding, balance tracking, and withdrawals.", icon: Wallet },
  { title: "Pools", description: "Live contest boards with real-time square selection and scoring.", icon: LayoutGrid },
  { title: "Leaderboards", description: "Climb seasonal rankings and compete for platform recognition.", icon: Medal },
  { title: "Rewards", description: "Weekly reward drops, achievements, and progression milestones.", icon: Gift },
  { title: "Community", description: "Connect with competitors, share wins, and build your reputation.", icon: Users },
  { title: "Live Activity", description: "Real-time feed of wins, entries, and platform momentum.", icon: Activity },
  { title: "Player Profiles", description: "Public legacy profiles that grow with every contest.", icon: UserCircle },
  { title: "Notifications", description: "Game-day alerts, payout confirmations, and contest updates.", icon: Bell },
];

export const WHY_PLAYERS_CHOOSE: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Transparency", description: "Official rules, public contest logic, and open Trust Center documentation.", icon: Eye },
  { title: "Responsible Competition", description: "Healthy play tools, limits, and resources for every competitor.", icon: HeartHandshake },
  { title: "Mobile First", description: "Play, track, and celebrate from any phone — or add to your home screen.", icon: Smartphone },
  { title: "Community", description: "Compete alongside friends with shared boards and live activity.", icon: Users },
  { title: "Fast Withdrawals", description: "Verified payouts processed securely through established payment rails.", icon: Clock },
  { title: "Secure Wallet", description: "Stripe-powered checkout with encrypted transactions and fraud protection.", icon: Lock },
];

export const TRUST_SECURITY_ITEMS: { title: string; description: string; icon: LucideIcon; href?: string }[] = [
  {
    title: "Identity Verification (KYC)",
    description: "Verification when required for withdrawals and account protection.",
    icon: Fingerprint,
    href: "/trust/identity-verification",
  },
  {
    title: "Fraud Prevention",
    description: "Automated monitoring, investigation workflows, and account safeguards.",
    icon: ShieldCheck,
    href: "/trust/fraud-prevention",
  },
  {
    title: "Enterprise Security",
    description: "Encryption, access controls, and incident response standards.",
    icon: Lock,
    href: "/trust/security",
  },
  {
    title: "Compliance",
    description: "Policies, contest rules, and regulatory documentation in one place.",
    icon: FileCheck,
    href: "/trust",
  },
  {
    title: "Trust Center",
    description: "Terms, privacy, refunds, fair play, and partner documentation.",
    icon: Building2,
    href: "/trust",
  },
  {
    title: "Secure Authentication",
    description: "Modern auth with device trust and account recovery protections.",
    icon: Shield,
    href: "/trust/security",
  },
];

export const FAQ_ITEMS: { question: string; answer: string; link?: { href: string; label: string } }[] = [
  {
    question: "How do I create a SquareBoards account?",
    answer:
      "Download the app or visit squareboards.pro, tap Create Account, and complete registration with your email. One account unlocks every game, wallet feature, and profile on the platform.",
  },
  {
    question: "Is SquareBoards a sportsbook or casino?",
    answer:
      "No. SquareBoards is a peer-to-peer competitive sports platform. You compete against other players in structured contests — never against the house.",
  },
  {
    question: "How does SquareWallet™ work?",
    answer:
      "SquareWallet™ is your secure platform balance. Add funds via Stripe checkout, use your balance to enter contests, and withdraw winnings to your verified payout method.",
  },
  {
    question: "When are payouts processed?",
    answer:
      "Winners are determined automatically when official scores finalize each period. Payouts are calculated and credited according to contest rules, typically within minutes of score confirmation.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "SquareBoards uses Stripe for secure card payments and wallet funding. Supported methods depend on your region and are shown at checkout.",
  },
  {
    question: "Why is identity verification required?",
    answer:
      "KYC helps protect accounts, prevent fraud, and comply with financial regulations. Verification may be required before your first withdrawal or for certain transaction thresholds.",
    link: { href: "/trust/identity-verification", label: "Identity Verification policy" },
  },
  {
    question: "How are contest winners determined?",
    answer:
      "Winners are based on official league scores matched to the published contest rules — typically the last digit of each team's score at defined checkpoints (quarters, innings, or final).",
    link: { href: "/trust/official-contest-rules", label: "Official Contest Rules" },
  },
  {
    question: "Can I get a refund on contest entries?",
    answer:
      "Refund eligibility depends on contest status and timing. Unfilled or cancelled contests may qualify for automatic refunds per our published policy.",
    link: { href: "/trust/refund-policy", label: "Refund Policy" },
  },
  {
    question: "How does SquareBoards prevent fraud?",
    answer:
      "We use automated monitoring, identity verification, device trust signals, and manual review workflows to detect and respond to abusive activity.",
    link: { href: "/trust/fraud-prevention", label: "Fraud Prevention" },
  },
  {
    question: "Is my personal data secure?",
    answer:
      "Yes. We encrypt data in transit and at rest, limit access on a need-to-know basis, and publish our privacy practices in the Trust Center.",
    link: { href: "/trust/privacy-policy", label: "Privacy Policy" },
  },
  {
    question: "What sports and leagues are supported?",
    answer:
      "SquareBoards currently supports NFL, NBA, MLB, NCAA Football, and NCAA Basketball, with additional sports on the roadmap.",
  },
  {
    question: "Can I play on my phone?",
    answer:
      "Yes. SquareBoards is mobile-first. Use the web app on any phone or add SquareBoards to your home screen for a native-like experience.",
  },
  {
    question: "What is responsible competition?",
    answer:
      "We provide tools, guidelines, and resources to help competitors play within their means and maintain healthy habits.",
    link: { href: "/trust/responsible-competition", label: "Responsible Competition" },
  },
  {
    question: "Who operates SquareBoards?",
    answer:
      "SquareBoards is operated by ALTIVORA LABS LLC, a Florida-based technology company focused on premium digital sports experiences.",
    link: { href: "/about", label: "About SquareBoards" },
  },
  {
    question: "How do I contact support?",
    answer:
      "Visit the Support Center to message our team directly. We handle all account, payment, and contest inquiries — there are no third-party hosts.",
    link: { href: "/support", label: "Support Center" },
  },
  {
    question: "Where can I read the full terms and policies?",
    answer:
      "All legal documents, contest rules, and partner documentation are published in the Trust Center.",
    link: { href: "/trust", label: "Open Trust Center" },
  },
];

export const PHONE_SCREENS = [
  { id: "wallet", label: "Wallet" },
  { id: "pool", label: "Live Pool" },
  { id: "board", label: "Contest Board" },
  { id: "rewards", label: "Rewards" },
  { id: "leaderboards", label: "Leaderboards" },
  { id: "profile", label: "Player Profile" },
] as const;

export type PhoneScreenId = (typeof PHONE_SCREENS)[number]["id"];
