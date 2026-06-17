"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EntryTierSelector from "@/components/platform/EntryTierSelector";
import { parseEntryTierParam } from "@/lib/platform/core/entryTiers";

interface SportEntryTierNavProps {
  sport: string;
  className?: string;
}

function SportEntryTierNavInner({ sport, className = "" }: SportEntryTierNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCents = parseEntryTierParam(searchParams.get("tier"));

  function selectTier(cents: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tier", String(cents));
    router.push(`/games/${sport}?${params.toString()}`);
  }

  return (
    <EntryTierSelector
      selectedCents={selectedCents}
      onSelect={(tier) => selectTier(tier.cents)}
      className={className}
    />
  );
}

export default function SportEntryTierNav(props: SportEntryTierNavProps) {
  return (
    <Suspense fallback={null}>
      <SportEntryTierNavInner {...props} />
    </Suspense>
  );
}
