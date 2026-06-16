"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { CommunityPanelData } from "@/lib/competitorCard/types";
import GenesisEmptyState from "@/components/genesis/GenesisEmptyState";
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
          <GenesisEmptyState
            emoji="👥"
            title="Build your competitive network"
            description="Follow competitors in The Huddle, share picks, and grow your follower count — community reputation boosts your Competitor Score."
            actionLabel="Open The Huddle"
            actionHref="/huddle"
            context="community"
            compact
          />
        ) : (
          <ul className="space-y-2" role="list" aria-label="Featured followers">
            {community.featuredFollowers.map((follower) => (
              <li key={follower.slug}>
                <Link
                  href={`/player/${follower.slug}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors duration-300"
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
