"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";
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
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="Database Status"
        subtitle="Supabase persistence health and migration phase."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <KpiCard
          label="Supabase Connection"
          value={
            loading
              ? "…"
              : connection?.ok
                ? "Connected"
                : "Disconnected"
          }
          accent={connection?.ok ? "success" : "muted"}
        />
        <KpiCard
          label="Read Phase"
          value={`Phase ${phase}`}
          accent="purple"
        />
      </div>

      {!loading && connection && (
        <p className="text-sb-muted text-sm -mt-4">{connection.message}</p>
      )}

      <Card variant="glass" className="p-5 sm:p-6 space-y-5">
        <CardHeader title="Table Counts" />
        {loading ? (
          <SkeletonKpiGrid count={4} />
        ) : counts ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard label="Pools" value={counts.pools} accent="purple" />
            <KpiCard label="Players" value={counts.players} accent="muted" />
            <KpiCard label="Squares" value={counts.squares} accent="success" />
            <KpiCard label="Winners" value={counts.winners} accent="gold" />
          </div>
        ) : (
          <Alert variant="error">
            Could not load counts. Run the SQL migration in Supabase first.
          </Alert>
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleTestDatabase}
          disabled={testing || loading}
        >
          {testing ? "Testing..." : "Test Database"}
        </Button>

        {testResult && (
          <Alert variant={testResult.startsWith("Error") ? "error" : "success"}>
            {testResult}
          </Alert>
        )}
      </Card>

      <Card variant="glass" className="p-5 text-xs text-sb-muted space-y-2">
        <p>
          <span className="text-sb-secondary font-medium">Phase 1 (default):</span>{" "}
          New data writes to Supabase. Reads fall back to localStorage when a
          record is not in the database yet.
        </p>
        <p>
          <span className="text-sb-secondary font-medium">Phase 2:</span> Set{" "}
          <code className="text-sb-glow">NEXT_PUBLIC_DB_READ_PHASE=2</code> in{" "}
          <code className="text-sb-glow">.env.local</code> to read only from
          Supabase.
        </p>
      </Card>
    </div>
  );
}
