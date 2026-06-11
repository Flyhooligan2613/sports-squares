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
import Footer from "@/components/Footer";
import FeaturedPools from "@/components/landing/FeaturedPools";
import HeroSection from "@/components/landing/HeroSection";
import JoinPoolSection from "@/components/landing/JoinPoolSection";
import SocialProof from "@/components/landing/SocialProof";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { SectionHeader, Button } from "@/components/ui/Button";

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

const SPORTS = [
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

const WHY_PLAY = [
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
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col overflow-x-hidden">
      <main className="flex-1">
        <HeroSection />
        <SocialProof />
        <JoinPoolSection />
        <FeaturedPools />

        <section className="sb-section max-w-6xl mx-auto w-full px-4 sm:px-6">
          <ScrollReveal>
            <SectionHeader
              title="How It Works"
              subtitle="From invite to winning square in four simple steps."
            />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {PLAYER_STEPS.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 70}>
                <div className="sb-card-hover p-6 sm:p-7 h-full">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold mb-5">
                    {index + 1}
                  </span>
                  <h3 className="text-slate-50 font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="sb-section bg-slate-900/25 border-y border-slate-800/60">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
            <ScrollReveal>
              <SectionHeader title="Supported Sports" />
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {SPORTS.map((sport, index) => (
                <ScrollReveal key={sport.name} delay={index * 60}>
                  <div className="sb-card-hover p-7 sm:p-8 text-center sm:text-left h-full">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-5">
                      <sport.icon className="w-6 h-6" strokeWidth={1.75} />
                    </span>
                    <h3 className="text-slate-50 font-semibold text-lg mb-2">
                      {sport.name}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {sport.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="sb-section max-w-6xl mx-auto w-full px-4 sm:px-6">
          <ScrollReveal>
            <SectionHeader
              title="Why Play With Us"
              subtitle="A premium squares experience built for players."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {WHY_PLAY.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 50}>
                <div className="sb-card-hover p-6 sm:p-7 h-full">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 mb-4">
                    <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="text-slate-50 font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="sb-section max-w-6xl mx-auto w-full px-4 sm:px-6 pb-8">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 p-8 sm:p-12 text-center shadow-2xl shadow-indigo-500/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-4 tracking-tight">
                  Ready to Host Your Own Pool?
                </h2>
                <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                  Bars, fundraisers, fantasy leagues, and friend groups use
                  SquareBoards to run paid pools with live scoring and zero
                  spreadsheets.
                </p>
                <Button href="/admin/login" variant="primary" className="min-w-[200px]">
                  Become a Host
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
