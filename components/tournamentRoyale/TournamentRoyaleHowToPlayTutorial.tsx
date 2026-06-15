"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TOURNAMENT_TUTORIAL_STEPS } from "@/lib/tournamentRoyale/config";
import { tournamentRoyalePath } from "@/lib/tournamentRoyale/routes";

export default function TournamentRoyaleHowToPlayTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TOURNAMENT_TUTORIAL_STEPS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const step = TOURNAMENT_TUTORIAL_STEPS[activeStep];

  return (
    <div
      className="tr-tutorial"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="tr-tutorial-stage" aria-live="polite">
        <div key={step.step} className="tr-tutorial-visual tr-tutorial-visual-enter">
          <div className="tr-bracket-mini" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
              <span
                key={i}
                className={[
                  "tr-bracket-mini-slot",
                  step.step >= 3 && i <= 1 ? "tr-bracket-mini-glow" : "",
                  step.step >= 4 && i === 0 ? "tr-bracket-mini-correct" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
          <p className="tr-tutorial-emoji" aria-hidden>
            {step.emoji}
          </p>
        </div>

        <div key={`copy-${step.step}`} className="tr-tutorial-copy tr-tutorial-copy-enter">
          <p className="text-xs uppercase tracking-wider text-blue-400/90 font-bold mb-2">
            Step {step.step} of {TOURNAMENT_TUTORIAL_STEPS.length}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-sb-muted text-sm leading-relaxed max-w-md mx-auto">{step.body}</p>
        </div>
      </div>

      <div className="tr-tutorial-dots" role="tablist" aria-label="Tutorial steps">
        {TOURNAMENT_TUTORIAL_STEPS.map((s, index) => (
          <button
            key={s.step}
            type="button"
            role="tab"
            aria-selected={index === activeStep}
            aria-label={`Step ${s.step}: ${s.title}`}
            className={`tr-tutorial-dot ${index === activeStep ? "tr-tutorial-dot-active" : ""}`}
            onClick={() => setActiveStep(index)}
          />
        ))}
      </div>

      <p className="text-center text-xs text-sb-muted mt-4">
        Hover to pause ·{" "}
        <Link href={tournamentRoyalePath()} className="text-sb-glow hover:text-white transition-colors">
          Back to Tournament Royale
          <ChevronRight className="inline w-3 h-3 -mt-0.5" />
        </Link>
      </p>
    </div>
  );
}
