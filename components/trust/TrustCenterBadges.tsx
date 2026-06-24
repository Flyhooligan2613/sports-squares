"use client";

import { CreditCard, Lock, Shield, UserCheck } from "lucide-react";

const TRUST_BADGES = [
  { label: "Secure Platform", Icon: Lock },
  { label: "Fair Competition", Icon: Shield },
  { label: "Verified Accounts", Icon: UserCheck },
  { label: "Secure Payments", Icon: CreditCard },
] as const;

export default function TrustCenterBadges() {
  return (
    <div
      className="trust-center-badges"
      aria-label="Platform trust indicators"
    >
      {TRUST_BADGES.map(({ label, Icon }) => (
        <span key={label} className="trust-center-badge">
          <Icon className="trust-center-badge-icon" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
