import { Suspense } from "react";
import {
  ShieldHalf,
  GraduationCap,
  Trophy,
  Shield,
  Zap,
  BarChart3,
  Smartphone,
  Sparkles,
  CircleDot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AnnouncementHomeHeroSlot from "@/components/announcements/AnnouncementHomeHeroSlot";
import Footer from "@/components/Footer";
import PlatformTrustStrip from "@/components/platform/PlatformTrustStrip";
import FeaturedPools from "@/components/landing/FeaturedPools";
import HeroSection from "@/components/landing/HeroSection";
import JoinPoolSection from "@/components/landing/JoinPoolSection";
import MarketplaceSports from "@/components/landing/MarketplaceSports";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import SocialProof from "@/components/landing/SocialProof";
import HomeLiveGamesFeed from "@/components/landing/HomeLiveGamesFeed";
import { LandingLiveProvider } from "@/components/landing/LandingLiveProvider";
import MoreWaysToPlaySection from "@/components/platform/MoreWaysToPlaySection";
import ScrollReveal from "@/components/ui/ScrollReveal";

const PLAYER_STEPS = [
  {
    title: "Choose Your Game",
    description:
      "Browse NFL, NBA, college, and more — every game has open boards ready to play.",
  },
  {
    title: "Purchase Squares Securely",
    description:
      "Pay with Stripe and get your personal access link instantly.",
  },
  {
    title: "Choose Your Lucky Squares",
    description:
      "Pick your spots on the board before kickoff locks the numbers.",
  },
  {
    title: "Watch Live and Win",
    description:
      "Track live scores with automatic winner updates every quarter.",
  },
];

const SPORTS: { name: string; icon: LucideIcon; description: string }[] = [
  {
    name: "NFL",
    icon: ShieldHalf,
    description: "Pro football squares for every game.",
  },
  {
    name: "NCAA Football",
    icon: GraduationCap,
    description: "College football boards, always open.",
  },
  {
    name: "NBA",
    icon: CircleDot,
    description: "Basketball squares with quarter winners.",
  },
  {
    name: "NCAA Basketball",
    icon: Trophy,
    description: "College hoops boards all season long.",
  },
];

const WHY_PLAY: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Secure Payments",
    description: "Checkout powered by Stripe — fast, safe, and familiar.",
    icon: Shield,
  },
  {
    title: "Instant Invite Links",
    description:
      "Get your personal link right after purchase to claim squares.",
    icon: Zap,
  },
  {
    title: "Automatic Scoring",
    description: "Live ESPN score sync keeps the board up to date.",
    icon: BarChart3,
  },
  {
    title: "Mobile Friendly",
    description: "Buy, pick, and track winners from any phone.",
    icon: Smartphone,
  },
  {
    title: "No Spreadsheet Required",
    description: "Everything runs online — no manual tracking needed.",
    icon: Sparkles,
  },
  {
    title: "Automatic Winner Tracking",
    description: "Quarter winners calculated and recorded for you.",
    icon: Trophy,
  },
];

export default function HomePage() {
  return (
    <LandingLiveProvider>
    <div className="landing-page min-h-[calc(100vh-3.5rem)] flex flex-col overflow-x-hidden">
      <main className="flex-1">
        <HeroSection />
        <AnnouncementHomeHeroSlot />
        <SocialProof />

        <LandingSection variant="glow">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Live"
              title="Happening right now"
              subtitle="Live scores and kickoff countdowns for this week's games — updated every 5 seconds."
            />
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <HomeLiveGamesFeed />
          </ScrollReveal>
        </LandingSection>

        <Suspense fallback={null}>
          <MarketplaceSports />
        </Suspense>
        <MoreWaysToPlaySection />
        <FeaturedPools />
        <JoinPoolSection />

        <LandingSection>
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="How It Works"
              title="From invite to winning square"
              subtitle="Four simple steps to play sports squares online."
            />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {PLAYER_STEPS.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 70}>
                <LandingGlassCard className="p-6 sm:p-7 h-full">
                  <span className="landing-step-number">{index + 1}</span>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sb-muted text-sm leading-relaxed">
                    {step.description}
                  </p>
                </LandingGlassCard>
              </ScrollReveal>
            ))}
          </div>
        </LandingSection>

        <LandingSection variant="alt">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Sports"
              title="Supported leagues"
              subtitle="SquareBoards creates boards for every major game automatically."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {SPORTS.map((sport, index) => (
              <ScrollReveal key={sport.name} delay={index * 60}>
                <LandingGlassCard className="p-7 sm:p-8 text-center sm:text-left h-full">
                  <span className="landing-icon-badge mx-auto sm:mx-0">
                    <sport.icon className="w-6 h-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {sport.name}
                  </h3>
                  <p className="text-sb-muted text-sm leading-relaxed">
                    {sport.description}
                  </p>
                </LandingGlassCard>
              </ScrollReveal>
            ))}
          </div>
        </LandingSection>

        <LandingSection variant="glow">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Why SquareBoards"
              title="Built for players who expect more"
              subtitle="A premium squares experience with secure checkout, live scores, and zero spreadsheets."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {WHY_PLAY.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 50}>
                <LandingGlassCard className="p-6 sm:p-7 h-full">
                  <span className="landing-icon-badge">
                    <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-sb-muted text-sm leading-relaxed">
                    {item.description}
                  </p>
                </LandingGlassCard>
              </ScrollReveal>
            ))}
          </div>
        </LandingSection>

        <div className="max-w-4xl mx-auto px-4 pb-8">
          <PlatformTrustStrip />
        </div>
      </main>
      <Footer landing />
    </div>
    </LandingLiveProvider>
  );
}
