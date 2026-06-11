import { BarChart3, Check, CreditCard, Link2, Trophy } from "lucide-react";

const FEATURES = [
  {
    icon: CreditCard,
    title: "Secure Stripe Payments",
  },
  {
    icon: Link2,
    title: "Instant Square Selection",
  },
  {
    icon: BarChart3,
    title: "Live Game Scoring",
  },
  {
    icon: Trophy,
    title: "Automatic Winner Tracking",
  },
];

interface HeroFeatureCardsProps {
  className?: string;
}

export default function HeroFeatureCards({ className = "" }: HeroFeatureCardsProps) {
  return (
    <ul className={`hero-trust-grid ${className}`}>
      {FEATURES.map((feature) => (
        <li key={feature.title} className="hero-trust-card group">
          <span className="hero-trust-check">
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
          <span className="hero-trust-icon">
            <feature.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
          </span>
          <span className="hero-trust-label">{feature.title}</span>
        </li>
      ))}
    </ul>
  );
}
