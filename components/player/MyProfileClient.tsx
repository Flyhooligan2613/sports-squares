"use client";

import { useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import UsernameSettings from "@/components/player/UsernameSettings";
import ProfileSocialView from "@/components/player/social/ProfileSocialView";
import { signOutPlayer } from "@/lib/auth/playerAuthClient";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import { Copy, Grid3X3, Share2, Wallet } from "lucide-react";

interface MyProfileClientProps {
  profile: PublicPlayerProfile;
  email: string;
}

export default function MyProfileClient({ profile, email }: MyProfileClientProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/player/${profile.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.displayName} on SquareBoards`,
          text: profile.headline,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share */
    }
  }

  async function handleSignOut() {
    await signOutPlayer();
    window.location.href = "/my-games/login";
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <p className="text-[10px] uppercase tracking-[0.3em] text-purple-400/80 mb-6">
        My Profile
      </p>

      <ProfileSocialView profile={profile} embedded />

      <section id="settings" className="mt-12 pt-10 border-t border-white/10 space-y-5 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
            Profile Settings
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              {copied ? (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </>
              )}
            </Button>
            <Button href={`/player/${profile.slug}`} variant="ghost" size="sm">
              View public page
            </Button>
          </div>
        </div>

        <UsernameSettings />

        <LandingGlassCard className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Account
          </h3>
          <p className="text-lg font-medium text-white">{email}</p>
          <p className="text-sb-muted text-sm mt-2">
            Member since{" "}
            {new Date(profile.memberSince).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
          <Link
            href={`/player/${profile.slug}`}
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-sb-glow bg-sb-purple/15 border border-sb-purple/30 rounded-full px-3 py-1 hover:bg-sb-purple/25 transition-colors"
          >
            squareboards.pro/player/{profile.slug}
          </Link>
        </LandingGlassCard>

        <LandingGlassCard className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet
          </h3>
          <p className="text-sb-muted text-sm leading-relaxed mb-4">
            Automatic Stripe payouts are coming soon. Your quarter wins will deposit directly to
            the card on file.
          </p>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sb-gold bg-sb-gold/10 border border-sb-gold/25 rounded-full px-3 py-1">
            Coming soon
          </span>
        </LandingGlassCard>

        <Button variant="ghost" onClick={handleSignOut} className="w-full sm:w-auto">
          Sign out
        </Button>
      </section>
    </div>
  );
}
