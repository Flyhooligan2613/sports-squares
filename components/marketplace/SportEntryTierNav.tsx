"use client";

import { useRouter, useSearchParams } from "next/navigation";
import EntryTierSelector from "@/components/platform/EntryTierSelector";
import { parseEntryTierParam } from "@/lib/platform/core/entryTiers";

interface SportEntryTierNavProps {
  sport: string;
  className?: string;
}

export default function SportEntryTierNav({ sport, className = "" }: SportEntryTierNavProps) {
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
