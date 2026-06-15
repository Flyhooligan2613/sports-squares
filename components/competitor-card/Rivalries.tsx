"use client";

import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { RivalryItem } from "@/lib/competitorCard/types";
import { SectionCard, SectionEmpty } from "./shared";

interface RivalriesProps {
  rivalries: RivalryItem[];
}

export default function Rivalries({ rivalries }: RivalriesProps) {
  return (
    <SectionCard id="rivalries" title={COMPETITOR_CARD_COPY.rivalries}>
      {rivalries.length === 0 ? (
        <SectionEmpty
          emoji="⚔️"
          title={COMPETITOR_CARD_COPY.empty.rivalries.title}
          body={COMPETITOR_CARD_COPY.empty.rivalries.body}
        />
      ) : (
        <ul className="space-y-3" role="list">
          {rivalries.map((rivalry) => (
            <li
              key={rivalry.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3"
            >
              <span className="text-2xl">{rivalry.opponentAvatar}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{rivalry.opponentName}</p>
                <p className="text-sm text-sb-muted">
                  {rivalry.wins}W · {rivalry.losses}L
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
