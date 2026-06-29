import { cn } from "../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? `sqds-input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <div className="sqds-input-wrap">
      {label ? (
        <label htmlFor={inputId} className="sqds-input-label">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn("sqds-input", error && "sqds-input--error", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="sqds-input-hint sqds-input-hint--error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="sqds-input-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
