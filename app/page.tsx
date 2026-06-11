import Link from "next/link";
import Footer from "@/components/Footer";
import FeaturedPools from "@/components/landing/FeaturedPools";
import HeroSection from "@/components/landing/HeroSection";
import JoinPoolSection from "@/components/landing/JoinPoolSection";

const PLAYER_STEPS = [
  {
    title: "Find Your Game",
    description: "Browse open pools or enter the pool code from your invite.",
  },
  {
    title: "Purchase Squares Securely",
    description: "Pay with Stripe and get your personal access link instantly.",
  },
  {
    title: "Choose Your Lucky Squares",
    description: "Pick your spots on the board before the numbers are locked.",
  },
  {
    title: "Watch Live Scores and Win",
    description: "Track the game with live scoring and automatic winner updates.",
  },
];

const SPORTS = [
  {
    name: "NFL",
    emoji: "🏈",
    description: "Pro football squares for every game.",
  },
  {
    name: "NCAA Football",
    emoji: "🏟️",
    description: "College football pools made easy.",
  },
  {
    name: "NBA",
    emoji: "🏀",
    description: "Basketball squares with quarter winners.",
  },
  {
    name: "NCAA Basketball",
    emoji: "🎓",
    description: "March Madness and regular season pools.",
  },
];

const WHY_PLAY = [
  {
    title: "Secure Payments",
    description: "Checkout powered by Stripe — fast, safe, and familiar.",
    icon: "🔒",
  },
  {
    title: "Instant Invite Links",
    description: "Get your personal link right after purchase to claim squares.",
    icon: "⚡",
  },
  {
    title: "Automatic Scoring",
    description: "Live ESPN score sync keeps the board up to date.",
    icon: "📊",
  },
  {
    title: "Mobile Friendly",
    description: "Buy, pick, and track winners from any phone.",
    icon: "📱",
  },
  {
    title: "No Spreadsheet Required",
    description: "Everything runs online — no manual tracking needed.",
    icon: "✨",
  },
  {
    title: "Automatic Winner Tracking",
    description: "Quarter winners calculated and recorded for you.",
    icon: "🏆",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col overflow-x-hidden">
      <main className="flex-1">
        <HeroSection />
        <JoinPoolSection />
        <FeaturedPools />

        {/* How it works — player focused */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              How It Works
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              From invite to winning square in four simple steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {PLAYER_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 landing-fade-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold mb-4">
                  {index + 1}
                </span>
                <h3 className="text-slate-100 font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Supported sports */}
        <section className="bg-slate-900/30 border-y border-slate-800/80 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 text-center mb-8 sm:mb-12">
              Supported Sports
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {SPORTS.map((sport) => (
                <div
                  key={sport.name}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-6 sm:p-7 transition-colors text-center sm:text-left"
                >
                  <span
                    className="text-4xl sm:text-5xl mb-4 block"
                    aria-hidden
                  >
                    {sport.emoji}
                  </span>
                  <h3 className="text-slate-100 font-semibold text-lg mb-2">
                    {sport.name}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {sport.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why play with us */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              Why Play With Us
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              A premium squares experience built for players.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_PLAY.map((item) => (
              <div
                key={item.title}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 hover:border-indigo-500/20 transition-colors"
              >
                <span className="text-2xl mb-3 block" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="text-slate-100 font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Host section — secondary */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-10 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-slate-200 mb-3">
              Want to Host Your Own Pool?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
              Businesses, bars, fundraisers, fantasy leagues, and friend groups
              can create and manage pools with payments, invites, and live
              scoring.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm mx-auto">
              <Link
                href="/admin/login"
                className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
              >
                Host Login
              </Link>
              <Link
                href="/create"
                className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-xl border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 font-semibold text-sm transition-colors"
              >
                Create Host Account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
