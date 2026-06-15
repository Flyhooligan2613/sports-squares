"use client";

import { useEffect, useMemo, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import ContestCenterHeader from "@/components/contest-center/ContestCenterHeader";
import ContestFilters from "@/components/contest-center/ContestFilters";
import ContestSearch from "@/components/contest-center/ContestSearch";
import FeaturedContestCard from "@/components/contest-center/FeaturedContestCard";
import FriendsPlayingSection from "@/components/contest-center/FriendsPlayingSection";
import TrendingSection from "@/components/contest-center/TrendingSection";
import QuickJoinBanner, {
  RecommendationsSection,
} from "@/components/contest-center/QuickJoinBanner";
import PrivateContestsSection from "@/components/contest-center/PrivateContestsSection";
import { LiveContestsSection } from "@/components/contest-center/ContestEmptyState";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperiencePageSkeleton from "@/components/ui/ExperiencePageSkeleton";
import { Button } from "@/components/ui/Button";
import type { ActionCenterData } from "@/lib/actionCenter/types";
import {
  buildContestCenterViewModel,
  contestMatchesFilter,
  contestMatchesSearch,
  LAST_CONTEST_KEY,
} from "@/lib/contestCenter/buildViewModel";
import type { ContestFilterId, ContestListing } from "@/lib/contestCenter/types";
import type { HomeFriendsPanel } from "@/lib/gameDay/types";
import { fastFetchJson, isDocumentVisible } from "@/lib/client/fastFetch";
import { usePullRefresh } from "@/lib/client/usePullRefresh";
import { CONTEST_CENTER } from "@/lib/platform/language";

const POLL_MS = 15_000;
const CACHE_KEY = "action-center";

function groupBySport(contests: ContestListing[]) {
  const map = new Map<string, ContestListing[]>();
  for (const contest of contests) {
    const key = contest.sport;
    const list = map.get(key) ?? [];
    list.push(contest);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([sport, items]) => ({ sport, items }));
}

function resolveQuickJoin(all: ContestListing[]): ContestListing | null {
  try {
    const lastId = localStorage.getItem(LAST_CONTEST_KEY);
    if (!lastId) return null;
    return all.find((c) => c.id === lastId) ?? null;
  } catch {
    return null;
  }
}

export default function ContestCenterExperience() {
  const [actionData, setActionData] = useState<ActionCenterData | null>(null);
  const [friends, setFriends] = useState<HomeFriendsPanel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContestFilterId>("all");
  const [search, setSearch] = useState("");
  const [quickJoin, setQuickJoin] = useState<ContestListing | null>(null);

  async function loadAction(force = false) {
    if (force) {
      const res = await fetch("/api/action-center", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as ActionCenterData;
      return data;
    }
    return fastFetchJson<ActionCenterData>(CACHE_KEY, "/api/action-center", {
      maxAgeMs: 20_000,
    });
  }

  async function loadFriends(force = false) {
    try {
      if (force) {
        const res = await fetch("/api/home", { cache: "no-store" });
        if (!res.ok) return null;
        const json = (await res.json()) as { friendsPlaying?: HomeFriendsPanel };
        return json.friendsPlaying ?? null;
      }
      const json = await fastFetchJson<{ friendsPlaying?: HomeFriendsPanel }>("home-friends", "/api/home", {
        maxAgeMs: 30_000,
      });
      return json.friendsPlaying ?? null;
    } catch {
      return null;
    }
  }

  async function load(force = false) {
    try {
      const [action, friendsPanel] = await Promise.all([loadAction(force), loadFriends(force)]);
      setActionData(action);
      setFriends(friendsPanel);
      setError(null);
    } catch {
      setError(`Could not refresh the ${CONTEST_CENTER.shortTitle}.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (isDocumentVisible()) void load(true);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  usePullRefresh(() => load(true));

  const viewModel = useMemo(() => {
    if (!actionData) return null;
    return buildContestCenterViewModel({
      action: actionData,
      friends: friends?.friendHighlights,
    });
  }, [actionData, friends]);

  useEffect(() => {
    if (!viewModel) return;
    const all = [
      ...viewModel.liveContests,
      ...(viewModel.featured ? [viewModel.featured] : []),
    ];
    setQuickJoin(resolveQuickJoin(all));
  }, [viewModel]);

  const friendHrefs = useMemo(
    () => new Set(viewModel?.friendsActivity.map((f) => f.href).filter(Boolean)),
    [viewModel]
  );

  const filteredLive = useMemo(() => {
    if (!viewModel) return [];
    let list = viewModel.liveContests;

    if (filter === "friends") {
      list = list.filter((c) => friendHrefs.has(c.href));
    } else if (filter === "recent" && quickJoin) {
      list = list.filter((c) => c.id === quickJoin.id);
    } else {
      list = list.filter((c) => contestMatchesFilter(c, filter));
    }

    list = list.filter((c) => contestMatchesSearch(c, search));
    return list;
  }, [viewModel, filter, search, friendHrefs, quickJoin]);

  const groupedLive = useMemo(() => groupBySport(filteredLive), [filteredLive]);

  return (
    <div className="cc-page lwc-page min-h-screen flex flex-col">
      <AppMenuBar />

      <main className="flex-1 relative overflow-hidden pb-20 lg:pb-10">
        <AmbientBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <ContestCenterHeader />

          <div className="cc-toolbar">
            <ContestSearch value={search} onChange={setSearch} />
            <ContestFilters active={filter} onChange={setFilter} />
          </div>

          {loading ? (
            <ExperiencePageSkeleton variant="action-center" />
          ) : error && !viewModel ? (
            <div className="text-center py-16">
              <p className="text-sb-muted mb-4">{error}</p>
              <Button onClick={() => load()}>Try again</Button>
            </div>
          ) : viewModel ? (
            <div className="cc-body space-y-10 sm:space-y-12">
              {quickJoin ? <QuickJoinBanner contest={quickJoin} /> : null}

              {viewModel.featured ? (
                <section
                  id="cc-featured-contests"
                  className="cc-section hub-section-anchor"
                  aria-labelledby="cc-featured-heading"
                >
                  <h2 id="cc-featured-heading" className="cc-section-title">
                    {CONTEST_CENTER.featuredCompetitions}
                  </h2>
                  <FeaturedContestCard contest={viewModel.featured} />
                </section>
              ) : null}

              <LiveContestsSection
                contests={groupedLive}
                empty={filteredLive.length === 0}
              />

              <TrendingSection contests={viewModel.trendingContests} />

              <FriendsPlayingSection items={viewModel.friendsActivity} />

              <RecommendationsSection contests={viewModel.recommendations} />

              <PrivateContestsSection />

              <p className="text-center text-xs text-sb-muted">
                Updated {new Date(viewModel.updatedAt).toLocaleTimeString()} · Refreshes
                every {POLL_MS / 1000}s
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
