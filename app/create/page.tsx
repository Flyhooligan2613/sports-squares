"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
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
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-16 sb-page-enter">
      <PageHeader
        title="Create a Pool"
        subtitle="Set up a new squares pool and share the link with friends."
      />

      <Card variant="glass" className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Pool Name"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Super Bowl Squares"
          />
          <Input
            label="Away Team"
            id="awayTeam"
            value={awayTeam}
            onChange={(e) => {
              setAwayTeam(e.target.value);
              setError("");
            }}
            placeholder="49ers"
          />
          <Input
            label="Home Team"
            id="homeTeam"
            value={homeTeam}
            onChange={(e) => {
              setHomeTeam(e.target.value);
              setError("");
            }}
            placeholder="Chiefs"
          />

          {error && <Alert variant="error">{error}</Alert>}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Pool"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
