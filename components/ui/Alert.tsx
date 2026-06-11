import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const CONFIG: Record<
  AlertVariant,
  { icon: typeof Info; className: string }
> = {
  info: {
    icon: Info,
    className:
      "bg-sb-purple/10 border-sb-purple/25 text-sb-secondary",
  },
  success: {
    icon: CheckCircle2,
    className:
      "bg-sb-success/10 border-sb-success/25 text-sb-secondary",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "bg-sb-gold/10 border-sb-gold/25 text-sb-secondary",
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-500/10 border-red-500/25 text-sb-secondary",
  },
};

export default function Alert({
  variant = "info",
  children,
  className = "",
}: AlertProps) {
  const { icon: Icon, className: variantClass } = CONFIG[variant];

  return (
    <div
      className={`flex gap-3 items-start rounded-xl border px-4 py-3 text-sm leading-relaxed ${variantClass} ${className}`}
      role="alert"
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5 opacity-90" strokeWidth={2} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
