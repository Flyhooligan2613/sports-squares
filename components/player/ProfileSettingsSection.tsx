"use client";

import { useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import UsernameSettings from "@/components/player/UsernameSettings";
import AvatarSettings from "@/components/player/AvatarSettings";
import ProfileIdentitySettings from "@/components/player/ProfileIdentitySettings";
import ProfileWalletSection from "@/components/player/ProfileWalletSection";
import { signOutPlayer } from "@/lib/auth/playerAuthClient";
import { PROFILE_LABELS } from "@/lib/platform/language";
import { publicProfilePath } from "@/lib/player/slug";
import { Copy, Grid3X3, Share2 } from "lucide-react";

interface ProfileSettingsSectionProps {
  slug: string;
  email: string;
}

export default function ProfileSettingsSection({ slug, email }: ProfileSettingsSectionProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${publicProfilePath(slug)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SquareBoards Player Profile",
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
    <section id="settings" className="mt-12 pt-10 border-t border-white/10 space-y-5 scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
          {PROFILE_LABELS.settings}
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
        </div>
      </div>

      <UsernameSettings />

      <AvatarSettings />

      <ProfileIdentitySettings />

      <LandingGlassCard className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2 flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" />
          Account
        </h3>
        <p className="text-lg font-medium text-white">{email}</p>
        <Link
          href={publicProfilePath(slug)}
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-sb-glow bg-sb-purple/15 border border-sb-purple/30 rounded-full px-3 py-1 hover:bg-sb-purple/25 transition-colors duration-300"
        >
          squareboards.pro{publicProfilePath(slug)}
        </Link>
      </LandingGlassCard>

      <ProfileWalletSection />

      <Button variant="ghost" onClick={handleSignOut} className="w-full sm:w-auto">
        Sign out
      </Button>
    </section>
  );
}
