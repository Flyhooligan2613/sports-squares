"use client";

import { CompetitorCardExperience } from "@/components/competitor-card";
import { Button } from "@/components/ui/Button";
import type { CompetitorCardData } from "@/lib/competitorCard/types";
import { PLAYER_TERMS } from "@/lib/platform/language";
import { publicProfilePath } from "@/lib/player/slug";

interface MyProfileClientProps {
  slug: string;
  email: string;
  initialCompetitorCard?: CompetitorCardData | null;
}

export default function MyProfileClient({
  slug,
  initialCompetitorCard = null,
}: MyProfileClientProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap gap-2 justify-end">
        <Button href={`${publicProfilePath(slug)}#settings`} variant="secondary" size="sm">
          Edit Profile
        </Button>
      </div>

      <CompetitorCardExperience
        mode="own"
        slug={slug}
        initialData={initialCompetitorCard}
      />
    </div>
  );
}
