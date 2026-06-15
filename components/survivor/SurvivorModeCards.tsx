import Link from "next/link";
import { ChevronRight } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { SURVIVOR_MODES } from "@/lib/survivor/config";
import { survivorPath } from "@/lib/survivor/routes";

const MODE_HREF: Record<string, string> = {
  classic: survivorPath("week"),
  global: survivorPath("week"),
  double_life: survivorPath("leagues"),
  turbo: survivorPath("leagues"),
  private: survivorPath("private"),
};

const MODE_CTA: Record<string, string> = {
  classic: "Play Classic",
  global: "Play Global Survivor",
  double_life: "Join Double Life",
  turbo: "Join Turbo Sprint",
  private: "Create or Join Private",
};

export default function SurvivorModeCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {SURVIVOR_MODES.map((mode) => (
        <LandingGlassCard
          key={mode.id}
          className={`p-5 sm:p-6 h-full flex flex-col ${mode.available ? "landing-glass-card-hover" : "opacity-90"}`}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-2xl" aria-hidden>
              {mode.emoji}
            </span>
            {mode.badge ? (
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-sb-muted/30 text-sb-muted">
                {mode.badge}
              </span>
            ) : null}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{mode.title}</h3>
          <p className="text-sm text-sb-muted leading-relaxed flex-1 mb-4">{mode.description}</p>
          {mode.available ? (
            <Link
              href={MODE_HREF[mode.id] ?? survivorPath("leagues")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              {MODE_CTA[mode.id] ?? "Play Survivor"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="text-xs text-sb-muted">Launching in a future phase</span>
          )}
        </LandingGlassCard>
      ))}
    </div>
  );
}
