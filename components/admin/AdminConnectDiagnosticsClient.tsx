"use client";

import { useCallback, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

type DiagnosticReport = {
  accountId: string;
  playerEmail: string | null;
  healthy: boolean;
  canRepair: boolean;
  repairFixesConfig: boolean;
  expected: {
    dashboard: string;
    feesCollector: string;
    lossesCollector: string;
  };
  stripe: {
    contactEmail: string | null;
    dashboard: string | null;
    feesCollector: string | null;
    lossesCollector: string | null;
    cardPaymentsStatus: string | null;
    transfersStatus: string | null;
    requirementsStatus: string | null;
    detailsSubmitted: boolean;
    payoutsEnabled: boolean;
  };
  dbStatus: {
    ready: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  } | null;
  issues: {
    field: string;
    expected: string;
    actual: string | null;
    severity: "error" | "warning";
    message: string;
  }[];
  error?: string;
};

export default function AdminConnectDiagnosticsClient() {
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupParam = query.includes("@")
    ? `email=${encodeURIComponent(query.trim())}`
    : `accountId=${encodeURIComponent(query.trim())}`;

  const inspect = useCallback(async () => {
    if (query.trim().length < 3) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/connect/accounts?${lookupParam}`);
    const data = (await res.json()) as DiagnosticReport & { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Inspection failed.");
      setReport(null);
      return;
    }
    setReport(data);
  }, [lookupParam, query]);

  async function runAction(action: "repair" | "sync") {
    if (!query.trim()) return;
    setBusy(true);
    setError(null);

    const payload = query.includes("@")
      ? { email: query.trim(), action }
      : { accountId: query.trim(), action };

    const res = await fetch("/api/admin/connect/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as DiagnosticReport & { error?: string };
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Action failed.");
      return;
    }
    setReport(data);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Cash-out / Connect diagnostics"
        subtitle="Inspect Stripe Accounts v2 payout configuration and repair misconfigured accounts."
      />

      <LandingGlassCard className="p-5 sm:p-6 space-y-4">
        <label htmlFor="connect-lookup" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted">
          Player email or Stripe account ID (acct_…)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="connect-lookup"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="player@example.com or acct_123..."
            className="player-input flex-1"
          />
          <Button type="button" onClick={() => void inspect()} disabled={loading || query.trim().length < 3}>
            {loading ? "Inspecting…" : "Inspect account"}
          </Button>
        </div>
        <p className="text-xs text-sb-muted leading-relaxed">
          This replaces manual Stripe curl checks. Errors about{" "}
          <span className="text-white">dashboard</span>,{" "}
          <span className="text-white">card_payments</span>, or{" "}
          <span className="text-white">fees_collector / losses_collector</span> are fixed by{" "}
          <strong className="text-white font-medium">Repair configuration</strong> or when the player taps{" "}
          <strong className="text-white font-medium">Set up cash-out</strong> after deploy.
        </p>
      </LandingGlassCard>

      {error ? (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      ) : null}

      {report ? (
        <div className="space-y-4">
          <LandingGlassCard className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Status</p>
                <p className={`text-lg font-bold ${report.healthy ? "text-emerald-400" : "text-amber-300"}`}>
                  {report.healthy ? "Healthy" : "Needs attention"}
                </p>
                <p className="text-sm text-sb-muted mt-2 font-mono break-all">{report.accountId}</p>
                {report.playerEmail ? (
                  <p className="text-sm text-sb-muted mt-1">{report.playerEmail}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {report.canRepair ? (
                  <Button type="button" disabled={busy} onClick={() => void runAction("repair")}>
                    {busy ? "Working…" : "Repair configuration"}
                  </Button>
                ) : null}
                {report.playerEmail ? (
                  <Button type="button" variant="secondary" disabled={busy} onClick={() => void runAction("sync")}>
                    Sync from Stripe
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-sb-muted">Stripe (live)</p>
                <Row label="dashboard" value={report.stripe.dashboard} expected={report.expected.dashboard} />
                <Row label="fees_collector" value={report.stripe.feesCollector} expected={report.expected.feesCollector} />
                <Row label="losses_collector" value={report.stripe.lossesCollector} expected={report.expected.lossesCollector} />
                <Row label="card_payments" value={report.stripe.cardPaymentsStatus} />
                <Row label="stripe_transfers" value={report.stripe.transfersStatus} />
                <Row label="requirements" value={report.stripe.requirementsStatus} />
                <Row label="payouts ready" value={report.stripe.payoutsEnabled ? "yes" : "no"} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-sb-muted">Database</p>
                {report.dbStatus ? (
                  <>
                    <Row label="ready" value={report.dbStatus.ready ? "yes" : "no"} />
                    <Row label="details submitted" value={report.dbStatus.detailsSubmitted ? "yes" : "no"} />
                    <Row label="payouts enabled" value={report.dbStatus.payoutsEnabled ? "yes" : "no"} />
                  </>
                ) : (
                  <p className="text-sb-muted">No linked player profile found.</p>
                )}
              </div>
            </div>
          </LandingGlassCard>

          {report.issues.length > 0 ? (
            <LandingGlassCard className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-white mb-3">Issues</p>
              <ul className="space-y-3">
                {report.issues.map((item) => (
                  <li
                    key={item.field}
                    className={[
                      "rounded-xl border px-4 py-3 text-sm",
                      item.severity === "error"
                        ? "border-red-500/30 bg-red-500/10 text-red-200"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-100",
                    ].join(" ")}
                  >
                    <p className="font-medium">{item.message}</p>
                    <p className="text-xs mt-1 opacity-90 font-mono break-all">
                      {item.field}: expected {item.expected}, got {item.actual ?? "null"}
                    </p>
                  </li>
                ))}
              </ul>
            </LandingGlassCard>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Row({
  label,
  value,
  expected,
}: {
  label: string;
  value: string | null;
  expected?: string;
}) {
  const mismatch = expected != null && value !== expected;
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sb-muted">{label}</span>
      <span className={mismatch ? "text-red-300 font-medium text-right" : "text-white text-right"}>
        {value ?? "null"}
      </span>
    </div>
  );
}
