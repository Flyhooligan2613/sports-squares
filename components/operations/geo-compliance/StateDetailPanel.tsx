"use client";

import { X } from "lucide-react";
import type { GeoState, GeoStateStatus } from "@/lib/operations/geo-compliance/types";

interface StateDetailPanelProps {
  state: GeoState | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<GeoStateStatus, string> = {
  live: "Live",
  under_review: "Under Review",
  disabled: "Disabled",
};

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="geo-detail-row">
      <dt className="geo-detail-label">{label}</dt>
      <dd className="geo-detail-value">{value}</dd>
    </div>
  );
}

export default function StateDetailPanel({ state, open, onClose }: StateDetailPanelProps) {
  if (!state) return null;

  return (
    <>
      <button
        type="button"
        className={`geo-panel-backdrop ${open ? "geo-panel-backdrop-visible" : ""}`}
        onClick={onClose}
        aria-label="Close state details"
        tabIndex={open ? 0 : -1}
      />
      <aside
        className={`geo-state-panel ${open ? "geo-state-panel-open" : ""}`}
        aria-label={`${state.name} details`}
        aria-hidden={!open}
      >
        <header className="geo-panel-header">
          <div>
            <p className="geo-panel-eyebrow">{state.id}</p>
            <h2 className="geo-panel-title">{state.name}</h2>
            <span className={`geo-status-badge geo-status-${state.status}`}>
              {STATUS_LABELS[state.status]}
            </span>
          </div>
          <button type="button" className="geo-panel-close" onClick={onClose} aria-label="Close panel">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </header>

        {state.status === "disabled" && state.disabledReason && (
          <div className="geo-panel-alert geo-panel-alert-danger" role="note">
            {state.disabledReason}
          </div>
        )}

        <dl className="geo-detail-grid">
          <DetailRow label="Population" value={formatNumber(state.population)} />
          <DetailRow label="Registered Players" value={formatNumber(state.registeredPlayers)} />
          <DetailRow label="Active Players" value={formatNumber(state.activePlayers)} />
          <DetailRow label="Revenue" value={formatCurrency(state.revenue)} />
          <DetailRow label="Wallet Volume" value={formatCurrency(state.walletVolume)} />
          <DetailRow label="Open Boards" value={formatNumber(state.openBoards)} />
          <DetailRow label="Completed Boards" value={formatNumber(state.completedBoards)} />
          <DetailRow label="Chargeback Rate" value={`${state.chargebackRate.toFixed(2)}%`} />
          <DetailRow label="Verification Rate" value={`${state.verificationRate.toFixed(1)}%`} />
          <DetailRow label="Referral Count" value={formatNumber(state.referralCount)} />
          <DetailRow label="Support Tickets" value={formatNumber(state.supportTickets)} />
          <DetailRow label="Compliance Alerts" value={formatNumber(state.complianceAlerts)} />
          <DetailRow
            label="Contest Types Enabled"
            value={state.contestTypesEnabled.join(", ") || "—"}
          />
          <DetailRow label="Sports Enabled" value={state.sportsEnabled.join(", ") || "—"} />
          <DetailRow
            label="Maximum Prize Pool"
            value={state.maxPrizePool ? formatCurrency(state.maxPrizePool) : "—"}
          />
          <DetailRow
            label="Deposit Limit"
            value={state.depositLimit ? formatCurrency(state.depositLimit) : "—"}
          />
          <DetailRow
            label="Withdrawal Limit"
            value={state.withdrawalLimit ? formatCurrency(state.withdrawalLimit) : "—"}
          />
          <DetailRow label="Age Requirement" value={`${state.ageRequirement}+`} />
          <DetailRow label="KYC Requirement" value={state.kycRequirement} />
          <DetailRow
            label="Payment Methods"
            value={state.paymentMethods.join(", ") || "—"}
          />
          <DetailRow label="Notes" value={state.notes} />
          <DetailRow label="Administrator" value={state.administrator} />
          <DetailRow
            label="Last Updated"
            value={new Date(state.lastUpdated).toLocaleString()}
          />
        </dl>
      </aside>
    </>
  );
}
