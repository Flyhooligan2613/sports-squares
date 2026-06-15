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
import HomeBrowseGamesStrip from "@/components/landing/HomeBrowseGamesStrip";
import HomeEcosystemSection from "@/components/landing/HomeEcosystemSection";
import HomeHappeningNow from "@/components/landing/HomeHappeningNow";
import HomePlatformValueSection from "@/components/landing/HomePlatformValueSection";
import HomeWeeklyRewardSection from "@/components/landing/HomeWeeklyRewardSection";
import JoinPoolSection from "@/components/landing/JoinPoolSection";
import MarketplaceSports from "@/components/landing/MarketplaceSports";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import SocialProof from "@/components/landing/SocialProof";
import { LandingLiveProvider } from "@/components/landing/LandingLiveProvider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PLAYER_STEPS = [
  {
    title: "Create Your Account",
    description:
      "One SquareBoards profile unlocks every game, reward, and feature on the platform.",
  },
  {
    title: "Pick Your Game",
    description:
      "Sports Squares, Pick'em, MLB Pick'em, and more — all from a single dashboard.",
  },
  {
    title: "Compete & Progress",
    description:
      "Earn XP, unlock achievements, climb leaderboards, and collect weekly rewards.",
  },
  {
    title: "Win & Get Paid",
    description:
      "Live scoring, automatic payouts, and a public profile that grows with every win.",
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
    title: "One Platform Account",
    description: "Every game, reward, and profile feature lives under one login.",
    icon: Sparkles,
  },
  {
    title: "Secure Payments",
    description: "Checkout powered by Stripe — fast, safe, and familiar.",
    icon: Shield,
  },
  {
    title: "Automatic Payouts",
    description: "Winners paid automatically — no spreadsheets, no chasing.",
    icon: Zap,
  },
  {
    title: "Live Sports Data",
    description: "ESPN score sync powers live boards, stats, and standings.",
    icon: BarChart3,
  },
  {
    title: "Mobile First",
    description: "Play, track, and celebrate wins from any phone.",
    icon: Smartphone,
  },
  {
    title: "Built To Grow",
    description: "New games and seasonal events added to the same ecosystem.",
    icon: Trophy,
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/my-games?mode=gameday");
  }

  return (
    <LandingLiveProvider>
      <div className="landing-page landing-page-enter min-h-[calc(100vh-3.5rem)] flex flex-col overflow-x-hidden">
        <main className="flex-1">
          <HeroSection />
          <HomeEcosystemSection />
          <HomePlatformValueSection />
          <AnnouncementHomeHeroSlot />
          <HomeHappeningNow />
          <HomeBrowseGamesStrip />

          <Suspense fallback={null}>
            <MarketplaceSports />
          </Suspense>

          <SocialProof />
          <HomeWeeklyRewardSection />

          <FeaturedPools />
          <JoinPoolSection />

          <LandingSection>
            <ScrollReveal>
              <LandingSectionHeader
                eyebrow="How It Works"
                title="Join the platform in four steps"
                subtitle="From sign-up to your first win — one account powers everything."
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
                eyebrow="Sports Squares"
                title="Supported leagues"
                subtitle="Classic squares boards for every major game — one part of the full SquareBoards platform."
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
                eyebrow="Platform"
                title="Built for the long game"
                subtitle="A premium sports gaming ecosystem — not just another squares pool."
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
