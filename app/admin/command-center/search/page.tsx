"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { CommandCenterSearchResult } from "@/lib/platform/engines/commandCenter";

export default function GlobalSearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CommandCenterSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch(term: string) {
    if (term.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/admin/command-center/search?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = (await res.json()) as { results: CommandCenterSearchResult[] };
        setResults(data.results);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery.trim().length >= 2) {
      void runSearch(initialQuery);
    }
  }, [initialQuery]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(query);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Global Search</h2>
        <p className="text-sm text-sb-muted mt-1">
          Search pools, players, payments, audit events, and support threads.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, pool, transaction…"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-sb-muted focus:outline-none focus:border-sb-purple/40"
        />
        <Button type="submit" variant="primary" size="sm" disabled={loading || query.trim().length < 2}>
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>

      {searched && (
        <LandingGlassCard className="p-4 sm:p-5">
          {results.length === 0 ? (
            <p className="text-sm text-sb-muted">No results for &ldquo;{query}&rdquo;.</p>
          ) : (
            <ul className="space-y-3">
              {results.map((result) => (
                <li key={`${result.type}:${result.id}`}>
                  <Link href={result.href} className="block group">
                    <p className="text-sm text-white group-hover:text-sb-glow transition-colors">
                      <span className="text-[10px] uppercase tracking-wider text-sb-muted mr-2">
                        {result.type}
                      </span>
                      {result.title}
                    </p>
                    <p className="text-xs text-sb-muted mt-0.5">{result.subtitle}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </LandingGlassCard>
      )}
    </div>
  );
}
