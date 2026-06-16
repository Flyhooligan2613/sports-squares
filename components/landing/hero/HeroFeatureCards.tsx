import { Check } from "lucide-react";

const FEATURES = [
  "Secure SquareWallet™ Payments",
  "Instant Square Selection",
  "Live Game Scoring",
  "Automatic Winner Tracking",
];

interface HeroFeatureCardsProps {
  className?: string;
}

export default function HeroFeatureCards({ className = "" }: HeroFeatureCardsProps) {
  return (
    <ul className={`hero-trust-strip ${className}`}>
      {FEATURES.map((title) => (
        <li key={title} className="hero-trust-strip-item">
          <Check className="w-3 h-3 shrink-0" strokeWidth={2.5} aria-hidden />
          <span>{title}</span>
        </li>
      ))}
    </ul>
  );
}
