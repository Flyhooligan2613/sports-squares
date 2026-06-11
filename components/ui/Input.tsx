import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  className = "",
  wrapperClassName = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={wrapperClassName}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sb-secondary text-sm font-medium block mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={["sb-input", error ? "border-red-500/50" : "", className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {hint && !error && (
        <p className="text-sb-muted text-xs mt-1.5">{hint}</p>
      )}
      {error && (
        <p className="text-red-400 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
}

export function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sb-secondary text-sm font-medium mb-2">{label}</p>
      {children}
    </div>
  );
}
