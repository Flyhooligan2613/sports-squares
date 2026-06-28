"use client";

export interface DevDemoActions {
  triggerTouchdown: () => void;
  triggerFieldGoal: () => void;
  triggerSafety: () => void;
  triggerQuarterEnd: () => void;
  triggerHalftime: () => void;
  triggerFinal: () => void;
  triggerWalletReward: () => void;
  triggerWinningSquare: () => void;
  triggerLosingSquare: () => void;
  triggerNotification: () => void;
  triggerYouWinSquare: () => void;
  triggerMysteryWinner: () => void;
  triggerQuarterPoolWin: () => void;
}

interface DevDemoPanelProps {
  open: boolean;
  onClose: () => void;
  actions: DevDemoActions;
}

const BUTTONS: { label: string; key: keyof DevDemoActions }[] = [
  { label: "Touchdown", key: "triggerTouchdown" },
  { label: "Field Goal", key: "triggerFieldGoal" },
  { label: "Safety", key: "triggerSafety" },
  { label: "Quarter End", key: "triggerQuarterEnd" },
  { label: "Halftime", key: "triggerHalftime" },
  { label: "Final", key: "triggerFinal" },
  { label: "Wallet Reward", key: "triggerWalletReward" },
  { label: "Winning Square", key: "triggerWinningSquare" },
  { label: "Losing Square", key: "triggerLosingSquare" },
  { label: "Simulate: You Win Square", key: "triggerYouWinSquare" },
  { label: "Simulate: Mystery Winner", key: "triggerMysteryWinner" },
  { label: "Simulate: Quarter Pool Win", key: "triggerQuarterPoolWin" },
  { label: "Notification", key: "triggerNotification" },
];

export default function DevDemoPanel({
  open,
  onClose,
  actions,
}: DevDemoPanelProps) {
  if (!open) return null;

  return (
    <div className="la-dev-panel" role="dialog" aria-label="Developer demo controls">
      <div className="la-dev-panel__header">
        <span className="la-dev-panel__badge">DEV</span>
        <p className="la-dev-panel__title">Demo Controls</p>
        <button
          type="button"
          onClick={onClose}
          className="la-dev-panel__close"
          aria-label="Close dev panel"
        >
          ×
        </button>
      </div>
      <div className="la-dev-panel__grid">
        {BUTTONS.map(({ label, key }) => (
          <button
            key={key}
            type="button"
            className="la-dev-panel__btn"
            onClick={() => actions[key]()}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="la-dev-panel__hint">
        Triple-tap corner · long-press header · ?dev=1
      </p>
    </div>
  );
}
