import {
  BarChart3,
  Link2,
  Shield,
  Trophy,
} from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Secure Payments",
    subtitle: "Powered by Stripe",
  },
  {
    icon: Link2,
    title: "Instant Invites",
    subtitle: "Share and play",
  },
  {
    icon: BarChart3,
    title: "Live Scoring",
    subtitle: "Real-time updates",
  },
  {
    icon: Trophy,
    title: "Auto Winners",
    subtitle: "Every quarter tracked",
  },
];

interface HeroFeatureCardsProps {
  className?: string;
}

export default function HeroFeatureCards({ className = "" }: HeroFeatureCardsProps) {
  return (
    <ul
      className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${className}`}
    >
      {FEATURES.map((feature) => (
        <li key={feature.title} className="hero-feature-card group">
          <span className="hero-feature-icon">
            <feature.icon className="w-4 h-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-white text-xs sm:text-sm font-semibold leading-tight">
              {feature.title}
            </p>
            <p className="text-sb-muted text-[10px] sm:text-xs mt-0.5 leading-tight">
              {feature.subtitle}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
