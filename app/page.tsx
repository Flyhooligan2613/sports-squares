import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import PoolList from "@/components/PoolList";

const STEPS = [
  { title: "Create a pool", description: "Set up your game, teams, and pricing in minutes." },
  { title: "Share your pool", description: "Send your pool link or invite players directly." },
  { title: "Players purchase squares", description: "Secure Stripe checkout assigns credits automatically." },
  { title: "Winners are calculated automatically", description: "ESPN score sync tracks winners as the game plays out." },
];

const SPORTS = [
  { name: "NFL", emoji: "🏈", description: "Pro football squares for every game." },
  { name: "NCAA Football", emoji: "🏟️", description: "College football pools made easy." },
  { name: "NBA", emoji: "🏀", description: "Basketball squares with quarter winners." },
  { name: "NCAA Basketball", emoji: "🎓", description: "March Madness and regular season pools." },
];

const FEATURES = [
  "Stripe Payments",
  "Automatic Invite Links",
  "ESPN Score Sync",
  "Winner Tracking",
  "Mobile Friendly",
  "No Spreadsheet Required",
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24 text-center">
            <div className="flex justify-center mb-6">
              <Logo href="/" className="text-lg sm:text-xl" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-100 leading-tight mb-5 max-w-4xl mx-auto">
              Play Sports Squares Online
            </h1>
            <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Create NFL, NCAA Football, NBA, and NCAA Basketball Squares Pools
              in Minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
              <Link
                href="/create"
                className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors text-center"
              >
                Create Pool
              </Link>
              <Link
                href="#pools"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-colors text-center"
              >
                Join Pool
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-14 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-3">
            How It Works
          </h2>
          <p className="text-slate-500 text-center text-sm sm:text-base mb-10 max-w-lg mx-auto">
            From setup to payout — everything runs in one place.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 sm:p-6"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold mb-4">
                  {index + 1}
                </span>
                <h3 className="text-slate-100 font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Supported sports */}
        <section className="bg-slate-900/30 border-y border-slate-800/80 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-10">
              Supported Sports
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SPORTS.map((sport) => (
                <div
                  key={sport.name}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl p-5 sm:p-6 transition-colors"
                >
                  <span className="text-3xl mb-3 block" aria-hidden>
                    {sport.emoji}
                  </span>
                  <h3 className="text-slate-100 font-semibold mb-1.5">
                    {sport.name}
                  </h3>
                  <p className="text-slate-500 text-sm">{sport.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-14 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-10">
            Built for Real Pools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3.5"
              >
                <span className="text-emerald-400 shrink-0" aria-hidden>
                  &#10003;
                </span>
                <span className="text-slate-200 text-sm font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Active pools */}
        <section id="pools" className="scroll-mt-20 pb-8">
          <PoolList />
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3">
              Ready to run your next pool?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mb-6 max-w-md mx-auto">
              Set up in minutes. Share your link. Let players buy squares and
              claim online.
            </p>
            <Link
              href="/create"
              className="inline-block px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
            >
              Create Your Pool
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
