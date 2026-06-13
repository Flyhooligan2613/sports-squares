"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

interface QuickPinPadProps {
  title?: string;
  subtitle?: string;
  confirmMode?: boolean;
  disabled?: boolean;
  error?: string | null;
  onComplete: (pin: string) => void | Promise<void>;
  onForgot?: () => void;
}

export default function QuickPinPad({
  title = "Enter Quick PIN",
  subtitle = "4-digit unlock code for this device",
  confirmMode = false,
  disabled = false,
  error = null,
  onComplete,
  onForgot,
}: QuickPinPadProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phase, setPhase] = useState<"enter" | "confirm">(confirmMode ? "enter" : "enter");

  const dots = useMemo(() => {
    const active = phase === "confirm" ? confirmPin : pin;
    return Array.from({ length: 4 }, (_, index) => index < active.length);
  }, [confirmPin, phase, pin]);

  async function appendDigit(digit: string) {
    if (disabled) return;

    if (phase === "enter") {
      const next = `${pin}${digit}`.slice(0, 4);
      setPin(next);
      if (next.length === 4) {
        if (confirmMode) {
          setPhase("confirm");
        } else {
          await onComplete(next);
          setPin("");
        }
      }
      return;
    }

    const next = `${confirmPin}${digit}`.slice(0, 4);
    setConfirmPin(next);
    if (next.length === 4) {
      if (next === pin) {
        await onComplete(next);
        setPin("");
        setConfirmPin("");
        setPhase("enter");
      } else {
        setConfirmPin("");
        setPin("");
        setPhase("enter");
      }
    }
  }

  function removeDigit() {
    if (disabled) return;
    if (phase === "confirm") {
      setConfirmPin((value) => value.slice(0, -1));
      return;
    }
    setPin((value) => value.slice(0, -1));
  }

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-2">Quick Unlock</p>
      <h3 className="text-xl font-bold text-white mb-1">{phase === "confirm" ? "Confirm PIN" : title}</h3>
      <p className="text-sm text-sb-muted mb-6">
        {phase === "confirm" ? "Enter the same PIN again" : subtitle}
      </p>

      <div className="flex justify-center gap-3 mb-6">
        {dots.map((filled, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full transition-all ${
              filled ? "bg-sb-purple-light shadow-[0_0_12px_rgba(168,85,247,0.8)]" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      {error ? (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {digits.map((digit, index) => {
          if (digit === "") return <div key={index} />;
          if (digit === "del") {
            return (
              <button
                key={index}
                type="button"
                disabled={disabled}
                onClick={removeDigit}
                className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-sb-muted hover:bg-white/[0.08] transition"
              >
                Delete
              </button>
            );
          }
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => void appendDigit(digit)}
              className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-semibold text-white hover:border-sb-purple-light/40 hover:bg-sb-purple/10 transition"
            >
              {digit}
            </button>
          );
        })}
      </div>

      {onForgot ? (
        <Button variant="ghost" className="w-full" disabled={disabled} onClick={onForgot}>
          Use email sign-in instead
        </Button>
      ) : null}
    </div>
  );
}
