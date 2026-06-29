"use client";

import { useMemo } from "react";
import { MapPin, ShieldCheck, ShieldX } from "lucide-react";
import { Badge, Card, GlassPanel } from "@/design-system";
import { MOCK_LOCATION_DEMOS } from "@/lib/operations/geo-operations";

const RESULT_CONFIG = {
  permitted: {
    icon: ShieldCheck,
    badge: "live" as const,
    label: "Permitted",
    className: "geo-ops-loc-permitted",
  },
  waitlist: {
    icon: MapPin,
    badge: "coming-soon" as const,
    label: "Waitlist",
    className: "geo-ops-loc-waitlist",
  },
  restricted: {
    icon: ShieldX,
    badge: "disabled" as const,
    label: "Restricted",
    className: "geo-ops-loc-restricted",
  },
};

export default function PlayerLocationEngine() {
  const demos = useMemo(() => MOCK_LOCATION_DEMOS, []);

  return (
    <section className="geo-section" aria-labelledby="geo-ops-location-heading">
      <header className="geo-section-header">
        <div>
          <h2 id="geo-ops-location-heading" className="geo-section-title">
            Player Location Engine
          </h2>
          <p className="geo-section-subtitle">
            Jurisdiction check demo — player-facing messages only, internal logic not exposed
          </p>
        </div>
      </header>

      <GlassPanel glow="purple" padding="md" className="geo-ops-location-intro">
        <p>
          The Player Location Engine evaluates competitor jurisdiction at signup, login, and
          contest entry. Results surface as permitted, waitlist, or restricted experiences —
          never exposing geo-fencing rules or internal scoring to players.
        </p>
      </GlassPanel>

      <div className="geo-ops-location-grid">
        {demos.map((demo, i) => {
          const config = RESULT_CONFIG[demo.result];
          const Icon = config.icon;
          return (
            <Card
              key={demo.id}
              variant="glass"
              className={`geo-ops-location-card ${config.className}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="geo-ops-location-card-header">
                <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <h3 className="geo-ops-location-label">{demo.label}</h3>
                  <p className="geo-ops-location-place">{demo.location}</p>
                </div>
                <Badge variant={config.badge} label={config.label} />
              </div>
              <p className="geo-ops-location-message">{demo.message}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
