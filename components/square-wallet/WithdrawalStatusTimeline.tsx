"use client";

import { Check } from "lucide-react";
import { WALLET_COPY } from "@/lib/platform/language/walletLanguage";

export type WithdrawalStage = "requested" | "processing" | "completed";

interface WithdrawalStatusTimelineProps {
  stage: WithdrawalStage;
  holdUntil?: string | null;
  className?: string;
}

const STAGES: Array<{ id: WithdrawalStage; label: string }> = [
  { id: "requested", label: WALLET_COPY.withdrawal.requested },
  { id: "processing", label: WALLET_COPY.withdrawal.processing },
  { id: "completed", label: WALLET_COPY.withdrawal.completed },
];

function stageIndex(stage: WithdrawalStage): number {
  return STAGES.findIndex((s) => s.id === stage);
}

export default function WithdrawalStatusTimeline({
  stage,
  holdUntil,
  className = "",
}: WithdrawalStatusTimelineProps) {
  const activeIdx = stageIndex(stage);

  return (
    <div className={className} role="status" aria-label="Withdrawal status">
      <ol className="flex items-center justify-between gap-2">
        {STAGES.map((item, idx) => {
          const done = idx < activeIdx;
          const active = idx === activeIdx;
          return (
            <li key={item.id} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  done
                    ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-300"
                    : active
                      ? "bg-sb-gold/15 border-sb-gold/50 text-sb-gold"
                      : "bg-white/5 border-white/10 text-sb-muted",
                ].join(" ")}
                aria-hidden
              >
                {done ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
              </div>
              <span
                className={[
                  "text-[10px] uppercase tracking-wide text-center truncate w-full",
                  active ? "text-white font-semibold" : done ? "text-emerald-300/80" : "text-sb-muted",
                ].join(" ")}
              >
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>

      {holdUntil && stage !== "completed" ? (
        <p className="text-xs text-sb-muted text-center mt-3">
          Review expected by{" "}
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(holdUntil))}
        </p>
      ) : (
        <p className="text-xs text-sb-muted text-center mt-3">{WALLET_COPY.withdrawal.estimatedArrival}</p>
      )}
    </div>
  );
}
