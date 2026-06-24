import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Cookie,
  CreditCard,
  FileText,
  HeartHandshake,
  Lock,
  Mail,
  Scale,
  Shield,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";

export const TRUST_LUCIDE_ICONS = {
  FileText,
  Shield,
  Trophy,
  Lock,
  HeartHandshake,
  Scale,
  Cookie,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  Users,
  Mail,
  CreditCard,
} as const satisfies Record<string, LucideIcon>;

export type TrustLucideIconName = keyof typeof TRUST_LUCIDE_ICONS;

export function TrustLucideIcon({
  name,
  className = "w-5 h-5",
}: {
  name: TrustLucideIconName;
  className?: string;
}) {
  const Icon = TRUST_LUCIDE_ICONS[name];
  return <Icon className={className} aria-hidden />;
}
