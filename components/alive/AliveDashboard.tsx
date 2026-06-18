"use client";

import { useEffect, useState } from "react";
import PlatformPulseCard from "./PlatformPulseCard";
import PersonalPulseCard from "./PersonalPulseCard";
import LiveActivityFeed from "./LiveActivityFeed";
import CommunityPresence from "./CommunityPresence";
import TrustBadge from "./TrustBadge";
import type {
  AliveActivityItem,
  CommunityPresenceData,
  PersonalPulse,
  PlatformPulse,
} from "@/lib/platform/alive/types";
import { resolveTimeOfDayGreeting } from "@/lib/platform/language/aliveLanguage";

interface AliveDashboardProps {
  displayName: string;
  greeting?: string;
  className?: string;
}

export default function AliveDashboard({
  displayName,
  greeting,
  className = "",
}: AliveDashboardProps) {
  const [platformPulse, setPlatformPulse] = useState<PlatformPulse | null>(null);
  const [personalPulse, setPersonalPulse] = useState<PersonalPulse | null>(null);
  const [activityFeed, setActivityFeed] = useState<AliveActivityItem[]>([]);
  const [community, setCommunity] = useState<CommunityPresenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [platformRes, personalRes, feedRes] = await Promise.all([
          fetch("/api/alive/platform-pulse", { credentials: "include" }),
          fetch("/api/alive/personal-pulse", { credentials: "include" }),
          fetch("/api/alive/activity-feed?limit=12", { credentials: "include" }),
        ]);

        if (!cancelled && platformRes.ok) {
          const json = (await platformRes.json()) as {
            platformPulse: PlatformPulse;
            communityPresence?: CommunityPresenceData;
          };
          setPlatformPulse(json.platformPulse);
          if (json.communityPresence) setCommunity(json.communityPresence);
        }

        if (!cancelled && personalRes.ok) {
          const json = (await personalRes.json()) as { personalPulse: PersonalPulse };
          setPersonalPulse(json.personalPulse);
        }

        if (!cancelled && feedRes.ok) {
          const json = (await feedRes.json()) as { activityFeed: AliveActivityItem[] };
          setActivityFeed(json.activityFeed ?? []);
        }
      } catch {
        // Pulse cards degrade gracefully — parent page still renders.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const timeGreeting = greeting ?? resolveTimeOfDayGreeting();

  return (
    <section className={["alive-dashboard space-y-4 mb-8 sm:mb-10", className].join(" ")}>
      <PlatformPulseCard
        greeting={timeGreeting}
        displayName={displayName}
        pulse={platformPulse}
        loading={loading}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <PersonalPulseCard pulse={personalPulse} loading={loading} />
        <div className="space-y-4">
          <LiveActivityFeed items={activityFeed} loading={loading} />
          <CommunityPresence data={community} loading={loading} />
        </div>
      </div>

      <TrustBadge className="justify-center sm:justify-start" />
    </section>
  );
}
