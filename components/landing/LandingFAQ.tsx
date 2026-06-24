"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { FAQ_ITEMS } from "@/lib/landing/blackLabelContent";

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <LandingSection id="faq" variant="alt" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          subtitle="Registration, wallet, payouts, security, and contest rules — answered clearly."
        />
      </ScrollReveal>
      <div className="max-w-3xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <ScrollReveal key={item.question} delay={index * 30}>
              <div className="landing-faq-item">
                <button
                  type="button"
                  className="landing-faq-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={[
                      "w-4 h-4 shrink-0 text-sb-muted transition-transform duration-300",
                      isOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>
                {isOpen && (
                  <div className="landing-faq-panel">
                    <p className="text-sb-muted text-sm leading-relaxed">{item.answer}</p>
                    {item.link && (
                      <Link
                        href={item.link.href}
                        className="inline-block mt-3 text-sm text-sb-glow hover:text-white transition-colors"
                      >
                        {item.link.label} →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </LandingSection>
  );
}
