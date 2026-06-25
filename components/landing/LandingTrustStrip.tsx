import { TRUST_STRIP_ITEMS } from "@/lib/landing/blackLabelContent";

export default function LandingTrustStrip() {
  return (
    <div className="landing-trust-strip" role="note" aria-label="Platform trust indicators">
      <div className="landing-trust-strip-inner">
        {TRUST_STRIP_ITEMS.map((item) => (
          <span key={item.label} className="landing-trust-strip-item">
            <span className="landing-trust-strip-icon" aria-hidden>
              <item.icon className="w-3.5 h-3.5" strokeWidth={2} />
            </span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
