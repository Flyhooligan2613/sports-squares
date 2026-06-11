"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { poolStore } from "@/lib/poolStore";

export default function CreatePoolPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !homeTeam.trim() || !awayTeam.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const pool = await poolStore.createPool({
        name: name.trim(),
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
      });
      router.push(`/pool/${pool.id}`);
    } catch {
      setError("Failed to create pool. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Create a Pool</h1>
      <p className="text-slate-500 text-sm mb-8">
        Set up a new squares pool and share the link with friends.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="text-slate-400 text-xs font-medium block mb-1.5">
            Pool Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="Super Bowl Squares"
            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
        </div>
        <div>
          <label htmlFor="awayTeam" className="text-slate-400 text-xs font-medium block mb-1.5">
            Away Team
          </label>
          <input
            id="awayTeam"
            value={awayTeam}
            onChange={(e) => { setAwayTeam(e.target.value); setError(""); }}
            placeholder="49ers"
            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
        </div>
        <div>
          <label htmlFor="homeTeam" className="text-slate-400 text-xs font-medium block mb-1.5">
            Home Team
          </label>
          <input
            id="homeTeam"
            value={homeTeam}
            onChange={(e) => { setHomeTeam(e.target.value); setError(""); }}
            placeholder="Chiefs"
            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-semibold transition-colors"
        >
          {loading ? "Creating..." : "Create Pool"}
        </button>
      </form>
    </main>
  );
}
