"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FOOTBALL_PICKEM_TUTORIAL_STEPS } from "@/lib/soccerPickem/config";
import { SOCCER_PICKEM_BASE_PATH } from "@/lib/soccerPickem/config";

export default function FootballPickemHowToPlayTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % FOOTBALL_PICKEM_TUTORIAL_STEPS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const step = FOOTBALL_PICKEM_TUTORIAL_STEPS[activeStep];

  return (
    <div
      className="fp-tutorial"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="fp-tutorial-stage" aria-live="polite">
        <div key={step.step} className="fp-tutorial-visual fp-tutorial-visual-enter">
          <div className="fp-pitch-mini" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={i}
                className={[
                  "fp-pitch-cell",
                  step.step >= 3 && i <= 2 ? "fp-pitch-cell-live" : "",
                  step.step >= 4 && i === 0 ? "fp-pitch-cell-correct" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
          <p className="fp-tutorial-emoji" aria-hidden>
            {step.emoji}
          </p>
        </div>

        <div key={`copy-${step.step}`} className="fp-tutorial-copy fp-tutorial-copy-enter">
          <p className="text-xs uppercase tracking-wider text-cyan-400/90 font-bold mb-2">
            Step {step.step} of {FOOTBALL_PICKEM_TUTORIAL_STEPS.length}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-sb-muted text-sm leading-relaxed max-w-md mx-auto">{step.body}</p>
        </div>
      </div>

      <div className="fp-tutorial-dots" role="tablist" aria-label="Tutorial steps">
        {FOOTBALL_PICKEM_TUTORIAL_STEPS.map((s, index) => (
          <button
            key={s.step}
            type="button"
            role="tab"
            aria-selected={index === activeStep}
            aria-label={`Step ${s.step}: ${s.title}`}
            className={`fp-tutorial-dot ${index === activeStep ? "fp-tutorial-dot-active" : ""}`}
            onClick={() => setActiveStep(index)}
          />
        ))}
      </div>

      <p className="text-center text-xs text-sb-muted mt-4">
        Hover to pause ·{" "}
        <Link href={SOCCER_PICKEM_BASE_PATH} className="text-sb-glow hover:text-white transition-colors">
          Back to Football Pick&apos;em Royale
          <ChevronRight className="inline w-3 h-3 -mt-0.5" />
        </Link>
      </p>
    </div>
  );
}
