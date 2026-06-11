"use client";

import { DollarSign, Grid3X3, Users, Zap } from "lucide-react";
import {
  formatPoolPrice,
  squaresRemaining,
} from "@/lib/landing/useHeroFeaturedPool";
import type { Pool } from "@/lib/types";

interface HeroStatCardsProps {
  pool: Pool | null;
  loading?: boolean;
}

const PLACEHOLDER = [
  { icon: DollarSign, label: "Per Square", value: "$10", accent: true },
  { icon: Grid3X3, label: "Squares Left", value: "100", accent: false },
  { icon: Users, label: "Players", value: "—", accent: false },
  { icon: Zap, label: "Status", value: "Open", accent: true },
];

export default function HeroStatCards({ pool, loading }: HeroStatCardsProps) {
  const stats = pool
    ? [
        {
          icon: DollarSign,
          label: "Per Square",
          value: formatPoolPrice(pool),
          accent: true,
        },
        {
          icon: Grid3X3,
          label: "Squares Left",
          value: String(squaresRemaining(pool)),
          accent: false,
        },
        {
          icon: Users,
          label: "Players",
          value: String(pool.participants.length),
          accent: false,
        },
        {
          icon: Zap,
          label: "Status",
          value: pool.status === "open" ? "Open" : "Closed",
          accent: pool.status === "open",
        },
      ]
    : PLACEHOLDER;

  return (
    <div className="hero-stat-cards">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`hero-stat-card ${loading ? "hero-stat-card-loading" : ""}`}
        >
          <stat.icon className="w-3.5 h-3.5 text-sb-glow shrink-0" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="hero-stat-label">{stat.label}</p>
            <p
              className={`hero-stat-value ${
                stat.accent ? "text-sb-success" : "text-white"
              }`}
            >
              {loading ? "…" : stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
