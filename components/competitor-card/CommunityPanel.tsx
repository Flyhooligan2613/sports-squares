"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { CommunityPanelData } from "@/lib/competitorCard/types";
import { publicProfilePath } from "@/lib/player/slug";
import { SectionCard } from "./shared";

interface CommunityPanelProps {
  community: CommunityPanelData;
}

export default function CommunityPanel({ community }: CommunityPanelProps) {
  return (
    <SectionCard id="community" title={COMPETITOR_CARD_COPY.community}>
      <LandingGlassCard className="p-6 sm:p-8">
        <dl className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Followers</dt>
            <dd className="text-2xl font-bold text-white mt-1">
              {community.followerCount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Following</dt>
            <dd className="text-2xl font-bold text-white mt-1">
              {community.followingCount.toLocaleString()}
            </dd>
          </div>
        </dl>
        {community.featuredFollowers.length === 0 ? (
          <AliveEmptyState
            context="no_followers"
            emoji="👥"
            title="Build your competitive network"
            body="As you compete and build your reputation, other players can follow your journey."
          />
        ) : (
          <ul className="space-y-2" role="list" aria-label="Featured followers">
            {community.featuredFollowers.map((follower) => (
              <li key={follower.slug}>
                <Link
                  href={publicProfilePath(follower.slug)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors duration-300 sb-card-lift min-h-[48px]"
                >
                  <span className="text-xl" aria-hidden>
                    {follower.avatarEmoji}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{follower.displayName}</p>
                    <p className="text-xs text-sb-muted">{follower.tierName}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </LandingGlassCard>
    </SectionCard>
  );
}
