"use client";

import { AUTOMATION_COPY } from "@/lib/platform/engines/squarePass/automation/config";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";

interface WhatsNextModalProps {
  open: boolean;
  missions?: Array<{ id: string; title: string; emoji: string; completed: boolean }>;
  onContinue: () => void;
}

export default function WhatsNextModal({ open, missions = [], onContinue }: WhatsNextModalProps) {
  return (
    <AutomationModalShell open={open}>
      <div className="p-8 space-y-5">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">{AUTOMATION_COPY.whatsNextTitle}</h2>
          <p className="text-sm text-sb-muted">{AUTOMATION_COPY.whatsNextMessage}</p>
        </div>
        <ul className="space-y-2">
          {missions.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm"
            >
              <span aria-hidden>{m.emoji}</span>
              <span className={m.completed ? "text-sb-muted line-through" : "text-white"}>
                {m.title}
              </span>
              {m.completed && (
                <span className="ml-auto text-xs text-sb-glow">Done</span>
              )}
            </li>
          ))}
        </ul>
        <ContinueJourneyButton onClick={onContinue} />
      </div>
    </AutomationModalShell>
  );
}
