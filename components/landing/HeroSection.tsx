"use client";

import Logo from "@/components/Logo";

const HERO_FEATURES = [
  "Secure Stripe Payments",
  "Instant Square Selection",
  "Live Game Scoring",
  "Automatic Winner Tracking",
];

export default function HeroSection() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative overflow-hidden min-h-[calc(100dvh-3.5rem)] sm:min-h-0 flex flex-col justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(100%,480px)] h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 pt-8 sm:pt-16 pb-10 sm:pb-20 text-center landing-fade-up">
        <div className="flex justify-center mb-5 sm:mb-6">
          <Logo href="/" className="text-base sm:text-lg" />
        </div>

        <h1 className="text-[1.75rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-100 mb-4 sm:mb-5 max-w-4xl mx-auto tracking-tight">
          Play Sports Squares Online
        </h1>

        <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-1">
          Buy NFL, College Football, NBA and March Madness squares in seconds.
        </p>

        <div className="flex flex-col gap-3 max-w-sm mx-auto sm:max-w-md">
          <button
            type="button"
            onClick={() => scrollTo("pools")}
            className="w-full min-h-[52px] px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-base transition-all shadow-lg shadow-indigo-600/25"
          >
            Play Now
          </button>
          <button
            type="button"
            onClick={() => scrollTo("join")}
            className="w-full min-h-[52px] px-8 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 active:scale-[0.98] text-slate-100 font-semibold text-base transition-all"
          >
            Enter Pool Code
          </button>
        </div>

        <ul className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto mt-12 text-left landing-fade-up landing-delay-1">
          {HERO_FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 bg-slate-900/50 border border-slate-800/80 rounded-lg px-3.5 py-2.5"
            >
              <span className="text-indigo-400 shrink-0 text-sm" aria-hidden>
                ✓
              </span>
              <span className="text-slate-300 text-xs sm:text-sm font-medium">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
