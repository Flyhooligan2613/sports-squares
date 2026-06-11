"use client";

import { useEffect, useState } from "react";
import { getDbReadPhase } from "@/lib/database/config";
import { dbGetCounts, dbTestRoundTrip } from "@/lib/database";
import type { DatabaseCounts } from "@/lib/database/types";
import { testSupabaseConnection } from "@/lib/supabase";

export default function DatabaseStatusPage() {
  const [connection, setConnection] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [counts, setCounts] = useState<DatabaseCounts | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  async function refresh() {
    setLoading(true);
    const conn = await testSupabaseConnection();
    setConnection(conn);

    try {
      const data = await dbGetCounts();
      setCounts(data);
    } catch (err) {
      setCounts(null);
      setTestResult(
        err instanceof Error ? err.message : "Failed to load table counts."
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleTestDatabase() {
    setTesting(true);
    setTestResult(null);
    const result = await dbTestRoundTrip();
    setTestResult(result.ok ? result.message : `Error: ${result.message}`);
    if (result.ok) {
      const data = await dbGetCounts();
      setCounts(data);
    }
    setTesting(false);
  }

  const phase = getDbReadPhase();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Database Status</h1>
        <p className="text-slate-500 text-sm mt-1">
          Supabase persistence health and migration phase.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <StatusCard
          label="Supabase Connection"
          value={
            loading
              ? "Checking..."
              : connection?.ok
                ? "Connected"
                : "Disconnected"
          }
          ok={connection?.ok}
          detail={connection?.message}
        />
        <StatusCard
          label="Read Phase"
          value={`Phase ${phase}`}
          ok
          detail={
            phase === 1
              ? "Writes to Supabase; reads localStorage fallback when DB empty."
              : "Reads entirely from Supabase."
          }
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-slate-200 font-semibold text-sm">Table Counts</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading counts...</p>
        ) : counts ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CountBadge label="Pools" value={counts.pools} />
            <CountBadge label="Players" value={counts.players} />
            <CountBadge label="Squares" value={counts.squares} />
            <CountBadge label="Winners" value={counts.winners} />
          </div>
        ) : (
          <p className="text-red-400 text-sm">
            Could not load counts. Run the SQL migration in Supabase first.
          </p>
        )}

        <button
          type="button"
          onClick={handleTestDatabase}
          disabled={testing || loading}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {testing ? "Testing..." : "Test Database"}
        </button>

        {testResult && (
          <p
            className={`text-xs rounded-lg px-3 py-2 border ${
              testResult.startsWith("Error")
                ? "text-red-400 bg-red-500/10 border-red-500/20"
                : "text-green-400 bg-green-500/10 border-green-500/20"
            }`}
          >
            {testResult}
          </p>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-xs text-slate-500 space-y-2">
        <p>
          <span className="text-slate-400 font-medium">Phase 1 (default):</span>{" "}
          New data writes to Supabase. Reads fall back to localStorage when a
          record is not in the database yet.
        </p>
        <p>
          <span className="text-slate-400 font-medium">Phase 2:</span> Set{" "}
          <code className="text-indigo-300">NEXT_PUBLIC_DB_READ_PHASE=2</code>{" "}
          in <code className="text-indigo-300">.env.local</code> to read only
          from Supabase.
        </p>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  ok,
  detail,
}: {
  label: string;
  value: string;
  ok?: boolean;
  detail?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p
        className={`text-lg font-bold mt-1 ${
          ok === false ? "text-red-400" : ok ? "text-green-400" : "text-slate-200"
        }`}
      >
        {value}
      </p>
      {detail && <p className="text-slate-600 text-xs mt-1">{detail}</p>}
    </div>
  );
}

function CountBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-center">
      <p className="text-2xl font-bold text-indigo-300 font-mono">{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}
