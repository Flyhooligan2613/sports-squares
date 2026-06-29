import { cn } from "../utils/cn";

export type ToastVariant = "default" | "success" | "error" | "info";

export interface ToastProps {
  title: string;
  message?: string;
  variant?: ToastVariant;
  icon?: React.ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<ToastVariant, string> = {
  default: "",
  success: "sqds-toast--success",
  error: "sqds-toast--error",
  info: "sqds-toast--info",
};

export function Toast({ title, message, variant = "default", icon, className }: ToastProps) {
  return (
    <div className={cn("sqds-toast", VARIANT_CLASS[variant], className)} role="status">
      {icon}
      <div>
        <p className="sqds-text-subheading" style={{ margin: 0, fontSize: "0.875rem" }}>
          {title}
        </p>
        {message ? <p className="sqds-text-caption" style={{ margin: "4px 0 0" }}>{message}</p> : null}
      </div>
    </div>
  );
}

export function ToastStack({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("sqds-toast-stack", className)}>{children}</div>;
}
