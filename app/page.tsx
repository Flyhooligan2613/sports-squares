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
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Footer from "@/components/Footer";
import FeaturedPools from "@/components/landing/FeaturedPools";
import HeroSection from "@/components/landing/HeroSection";
import JoinPoolSection from "@/components/landing/JoinPoolSection";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import SocialProof from "@/components/landing/SocialProof";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";

const PLAYER_STEPS = [
  {
    title: "Find Your Game",
    description:
      "Browse featured pools or enter the pool code from your invite.",
  },
  {
    title: "Purchase Squares Securely",
    description:
      "Pay with Stripe and get your personal access link instantly.",
  },
  {
    title: "Choose Your Lucky Squares",
    description:
      "Pick your spots on the board before the numbers are locked.",
  },
  {
    title: "Watch Live Scores and Win",
    description:
      "Track the game with live scoring and automatic winner updates.",
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
    description: "College football pools made easy.",
  },
  {
    name: "NBA",
    icon: CircleDot,
    description: "Basketball squares with quarter winners.",
  },
  {
    name: "NCAA Basketball",
    icon: Trophy,
    description: "March Madness and regular season pools.",
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
    <div className="landing-page min-h-[calc(100vh-3.5rem)] flex flex-col overflow-x-hidden">
      <main className="flex-1">
        <HeroSection />
        <SocialProof />
        <JoinPoolSection />
        <FeaturedPools />

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
              subtitle="Run squares pools for the biggest games in sports."
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

        <LandingSection>
          <ScrollReveal>
            <div className="landing-cta-banner">
              <div className="relative z-10">
                <p className="landing-section-eyebrow mb-4">For Hosts</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
                  Ready to Host Your Own Pool?
                </h2>
                <p className="text-sb-muted text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                  Bars, fundraisers, fantasy leagues, and friend groups use
                  SquareBoards to run paid pools with live scoring and zero
                  spreadsheets.
                </p>
                <Button
                  href="/admin/login"
                  variant="primary"
                  className="hero-btn-primary min-w-[220px] group"
                >
                  Become a Host
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </LandingSection>
      </main>
      <Footer landing />
    </div>
  );
}
