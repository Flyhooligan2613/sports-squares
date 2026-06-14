"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SURVIVOR_TUTORIAL_STEPS } from "@/lib/survivor/config";

export default function SurvivorHowToPlayTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % SURVIVOR_TUTORIAL_STEPS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const step = SURVIVOR_TUTORIAL_STEPS[activeStep];

  return (
    <div
      className="survivor-tutorial"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="survivor-tutorial-stage" aria-live="polite">
        <div
          key={step.step}
          className="survivor-tutorial-visual survivor-tutorial-visual-enter"
        >
          <div className="survivor-tutorial-grid" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                className={[
                  "survivor-tutorial-cell",
                  i === 4 ? "survivor-tutorial-cell-center" : "",
                  step.step >= 2 && i === 4 && step.step === 3
                    ? "survivor-tutorial-cell-eliminated"
                    : "",
                  step.step >= 2 && i === 4 && step.step !== 3
                    ? "survivor-tutorial-cell-survived"
                    : "",
                  step.step === 4 && i !== 4 ? "survivor-tutorial-cell-used" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
          <p className="survivor-tutorial-emoji" aria-hidden>
            {step.emoji}
          </p>
        </div>

        <div key={`copy-${step.step}`} className="survivor-tutorial-copy survivor-tutorial-copy-enter">
          <p className="text-xs uppercase tracking-wider text-amber-400/90 font-bold mb-2">
            Step {step.step} of {SURVIVOR_TUTORIAL_STEPS.length}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-sb-muted text-sm leading-relaxed max-w-md mx-auto">{step.body}</p>
        </div>
      </div>

      <div className="survivor-tutorial-dots" role="tablist" aria-label="Tutorial steps">
        {SURVIVOR_TUTORIAL_STEPS.map((s, index) => (
          <button
            key={s.step}
            type="button"
            role="tab"
            aria-selected={index === activeStep}
            aria-label={`Step ${s.step}: ${s.title}`}
            className={`survivor-tutorial-dot ${index === activeStep ? "survivor-tutorial-dot-active" : ""}`}
            onClick={() => setActiveStep(index)}
          />
        ))}
      </div>

      <p className="text-center text-xs text-sb-muted mt-4">
        Hover to pause ·{" "}
        <Link href="/survivor" className="text-sb-glow hover:text-white transition-colors">
          Back to Survivor X
          <ChevronRight className="inline w-3 h-3 -mt-0.5" />
        </Link>
      </p>
    </div>
  );
}
