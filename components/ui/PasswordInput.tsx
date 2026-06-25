"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function PasswordInput({
  id: idProp,
  value,
  onChange,
  placeholder = "Your password",
  autoComplete = "current-password",
  required,
  minLength,
  disabled,
  className = "",
  label,
}: PasswordInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className={`player-password-field ${className}`.trim()}>
      {label ? (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="player-input w-full pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="player-password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
