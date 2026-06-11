"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseConfig, testSupabaseConnection } from "@/lib/supabase";

type TestStatus = "idle" | "testing" | "success" | "error";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [message, setMessage] = useState(
    "Click the button to test your Supabase connection."
  );

  const config = getSupabaseConfig();

  async function runTest() {
    setStatus("testing");
    setMessage("Connecting to Supabase...");

    const result = await testSupabaseConnection();

    if (result.ok) {
      setStatus("success");
      setMessage(result.message);
    } else {
      setStatus("error");
      setMessage(`Connection failed: ${result.message}`);
    }
  }

  useEffect(() => {
    runTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusStyles = {
    idle: "border-slate-700 bg-slate-900 text-slate-300",
    testing: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
    success: "border-green-500/40 bg-green-500/10 text-green-300",
    error: "border-red-500/40 bg-red-500/10 text-red-300",
  };

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/"
        className="text-slate-500 hover:text-slate-300 text-xs mb-6 inline-block"
      >
        &larr; Back to home
      </Link>

      <h1 className="text-2xl font-bold text-slate-100 mb-2">
        Supabase Connection Test
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Verifies your Supabase URL and publishable key are configured correctly.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 mb-6 text-sm">
        <h2 className="text-slate-300 font-semibold">Configuration</h2>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">URL</span>
          <span className="text-slate-300 font-mono text-xs truncate max-w-[220px]">
            {config.url || "Not set"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Key</span>
          <span className="text-slate-300 font-mono text-xs">
            {config.publishableKey ? "Set (hidden)" : "Not set"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Env loaded</span>
          <span
            className={
              config.isConfigured ? "text-green-400" : "text-amber-400"
            }
          >
            {config.isConfigured ? "Yes" : "No — restart dev server"}
          </span>
        </div>
      </div>

      <div
        className={`rounded-xl border p-5 mb-6 transition-colors ${statusStyles[status]}`}
      >
        <p className="font-medium">{message}</p>
      </div>

      {!config.isConfigured && (
        <p className="text-amber-400/80 text-xs mb-4">
          If you just added .env.local, stop the dev server (Ctrl+C) and run{" "}
          <code className="text-amber-300">npm run dev</code> again.
        </p>
      )}

      <button
        type="button"
        onClick={runTest}
        disabled={status === "testing"}
        className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-semibold transition-colors"
      >
        {status === "testing" ? "Testing..." : "Run Test Again"}
      </button>
    </main>
  );
}
