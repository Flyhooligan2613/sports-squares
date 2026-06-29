"use client";

import { X } from "lucide-react";
import { Badge, Button, GlassPanel } from "@/design-system";
import type { GeoOperationsState, GeoStateStatus } from "@/lib/operations/geo-operations/types";

interface StateDetailDrawerProps {
  state: GeoOperationsState | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<GeoStateStatus, string> = {
  live: "Live",
  under_review: "Under Review",
  disabled: "Disabled",
};

const STATUS_BADGE: Record<GeoStateStatus, "live" | "review" | "disabled"> = {
  live: "live",
  under_review: "review",
  disabled: "disabled",
};

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function boolLabel(v: boolean): string {
  return v ? "Enabled" : "Disabled";
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="geo-detail-row">
      <dt className="geo-detail-label">{label}</dt>
      <dd className="geo-detail-value">{value}</dd>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="geo-drawer-section">
      <h3 className="geo-drawer-section-title">{title}</h3>
      <dl className="geo-detail-grid">{children}</dl>
    </div>
  );
}

export default function StateDetailDrawer({ state, open, onClose }: StateDetailDrawerProps) {
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
        className={`geo-state-panel geo-ops-drawer ${open ? "geo-state-panel-open" : ""}`}
        aria-label={`${state.name} details`}
        aria-hidden={!open}
      >
        <header className="geo-panel-header">
          <div>
            <p className="geo-panel-eyebrow">{state.id}</p>
            <h2 className="geo-panel-title">{state.name}</h2>
            <Badge variant={STATUS_BADGE[state.status]} label={STATUS_LABELS[state.status]} />
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close panel">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </Button>
        </header>

        {state.status === "disabled" && state.disabledReason && (
          <GlassPanel padding="sm" className="geo-drawer-alert">
            <p className="geo-drawer-alert-text">{state.disabledReason}</p>
          </GlassPanel>
        )}

        <DetailSection title="Jurisdiction">
          <DetailRow label="State Name" value={state.name} />
          <DetailRow label="Status" value={STATUS_LABELS[state.status]} />
          <DetailRow
            label="Last Reviewed"
            value={new Date(state.lastReviewed).toLocaleString()}
          />
          <DetailRow label="Platform Availability" value={state.platformAvailability} />
        </DetailSection>

        <DetailSection title="Feature Availability">
          <DetailRow label="Paid Contests" value={boolLabel(state.paidContests)} />
          <DetailRow label="Free Play" value={boolLabel(state.freePlay)} />
          <DetailRow label="Wallet" value={boolLabel(state.walletEnabled)} />
          <DetailRow label="Deposits" value={boolLabel(state.depositsEnabled)} />
          <DetailRow label="Withdrawals" value={boolLabel(state.withdrawalsEnabled)} />
          <DetailRow label="Referral Program" value={boolLabel(state.referralProgram)} />
        </DetailSection>

        <DetailSection title="Compliance & Limits">
          <DetailRow label="KYC Required" value={state.kycRequirement} />
          <DetailRow label="Minimum Age" value={`${state.ageRequirement}+`} />
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
          <DetailRow
            label="Payment Providers Available"
            value={state.paymentMethods.join(", ") || "—"}
          />
        </DetailSection>

        <DetailSection title="Player Metrics">
          <DetailRow label="Players Registered" value={formatNumber(state.registeredPlayers)} />
          <DetailRow label="Players Active" value={formatNumber(state.activePlayers)} />
          <DetailRow label="Today's Revenue" value={formatCurrency(state.todayRevenue)} />
          <DetailRow label="Today's Deposits" value={formatCurrency(state.todayDeposits)} />
          <DetailRow label="Today's Withdrawals" value={formatCurrency(state.todayWithdrawals)} />
          <DetailRow
            label="Average Contest Size"
            value={
              state.distribution.avgContestSize
                ? `${state.distribution.avgContestSize} entries`
                : "—"
            }
          />
          <DetailRow
            label="Retention"
            value={state.retention ? `${state.retention}%` : "—"}
          />
        </DetailSection>

        <DetailSection title="Risk & Support">
          <DetailRow label="Support Tickets" value={formatNumber(state.supportTickets)} />
          <DetailRow label="Chargeback Rate" value={`${state.chargebackRate.toFixed(2)}%`} />
          <DetailRow label="Verification Rate" value={`${state.verificationRate.toFixed(1)}%`} />
          <DetailRow label="Risk Score" value={`${state.riskScore}/100`} />
        </DetailSection>

        <DetailSection title="Notes">
          <DetailRow label="Compliance Notes" value={state.notes} />
          <DetailRow label="Administrator Notes" value={state.administratorNotes} />
        </DetailSection>
      </aside>
    </>
  );
}
