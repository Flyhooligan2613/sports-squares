"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import PickPostCard from "@/components/huddle/PickPostCard";
import PickOfWeekBanner from "@/components/huddle/PickOfWeekBanner";
import SurvivorPostCard from "@/components/huddle/SurvivorPostCard";
import GenesisEmptyState from "@/components/genesis/GenesisEmptyState";
import GenesisVisitTracker from "@/components/genesis/GenesisVisitTracker";
import type { HuddleFeedResponse, HuddleFeedSort } from "@/lib/huddle/types";
import { HUDDLE_TAGLINE } from "@/lib/huddle/types";

const SORTS: { id: HuddleFeedSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "trending", label: "Trending" },
  { id: "most_copied", label: "Most Copied" },
  { id: "most_liked", label: "Most Liked" },
  { id: "following", label: "Following" },
];

export default function HuddleClient() {
  const [sort, setSort] = useState<HuddleFeedSort>("newest");
  const [data, setData] = useState<HuddleFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/huddle/feed?sort=${sort}`, { cache: "no-store" });
    const json = (await res.json()) as HuddleFeedResponse;
    setData(json);
    setLoading(false);
  }, [sort]);

  useEffect(() => {
    void load();
  }, [load]);

  async function publishCard() {
    setPublishing(true);
    setMessage(null);
    const res = await fetch("/api/huddle/posts", { method: "POST", credentials: "include" });
    const json = (await res.json()) as { error?: string };
    setPublishing(false);
    if (!res.ok) {
      setMessage(json.error ?? "Could not publish.");
      return;
    }
    setMessage("Pick card published to The Huddle!");
    void load();
  }

  return (
    <div className="space-y-6">
      <GenesisVisitTracker missionId="open_community_feed" />
      <LandingGlassCard className="p-6 border border-purple-500/20">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-300 mb-2">👥 The Huddle</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Community Pick Feed</h1>
        <p className="text-sm text-sb-muted max-w-2xl">
          {HUDDLE_TAGLINE}. Share Pick&apos;em cards and Survivor X picks after kickoff — celebrate
          survival with the community.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button className="player-btn-glow" disabled={publishing} onClick={() => void publishCard()}>
            {publishing ? "Publishing…" : "Publish Pick'em Card"}
          </Button>
          <Link
            href="/pickem/week"
            className="inline-flex items-center px-4 py-2 rounded-xl border border-white/15 text-sm text-white hover:bg-white/5"
          >
            Pick&apos;em →
          </Link>
          <Link
            href="/survivor/week"
            className="inline-flex items-center px-4 py-2 rounded-xl border border-amber-400/25 text-sm text-amber-300 hover:bg-amber-500/10"
          >
            Survivor X →
          </Link>
        </div>
        {message ? <p className="text-sm text-emerald-300 mt-3">{message}</p> : null}
      </LandingGlassCard>

      {data?.pickOfWeek ? <PickOfWeekBanner post={data.pickOfWeek} onUpdate={load} /> : null}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSort(s.id)}
            className={[
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              sort === s.id
                ? "bg-sb-purple/30 text-white border border-sb-purple/40"
                : "text-sb-muted bg-white/5 hover:text-white",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sb-muted py-16 animate-pulse">Loading The Huddle…</p>
      ) : !data?.items.length ? (
        <GenesisEmptyState
          emoji="💬"
          title="The Huddle is warming up"
          description="While you find your first picks, explore trending posts from competitors across Pick'em and Survivor X — or publish your card after kickoff."
          actionLabel="Browse Pick'em"
          actionHref="/pickem/week"
          context="community"
        />
      ) : (
        <div className="space-y-4">
          {data.items.map((item) =>
            item.kind === "pickem" ? (
              <PickPostCard key={item.post.id} post={item.post} onUpdate={load} />
            ) : (
              <SurvivorPostCard key={item.post.id} post={item.post} onUpdate={load} />
            )
          )}
        </div>
      )}
    </div>
  );
}
