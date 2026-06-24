import { TRUST_STRIP_ITEMS } from "@/lib/landing/blackLabelContent";

export default function LandingTrustStrip() {
  return (
    <div className="landing-trust-strip" role="note" aria-label="Platform trust indicators">
      <div className="landing-trust-strip-inner">
        {TRUST_STRIP_ITEMS.map((item) => (
          <span key={item.label} className="landing-trust-strip-item">
            <item.icon className="w-3.5 h-3.5 text-sb-glow/80 shrink-0" strokeWidth={2} aria-hidden />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
