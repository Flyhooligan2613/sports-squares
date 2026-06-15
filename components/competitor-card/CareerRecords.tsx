"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { CareerRecord } from "@/lib/competitorCard/types";
import { SectionCard } from "./shared";

interface CareerRecordsProps {
  records: CareerRecord[];
}

export default function CareerRecords({ records }: CareerRecordsProps) {
  return (
    <SectionCard id="career-records" title={COMPETITOR_CARD_COPY.careerRecords}>
      <div className="grid sm:grid-cols-2 gap-3">
        {records.map((record, index) => (
          <LandingGlassCard
            key={record.id}
            className={`p-4 sm:p-5 admin-stat-enter ${record.highlight ? "border-sb-gold/30" : ""}`}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <p className="text-[10px] uppercase tracking-wider text-sb-muted">{record.label}</p>
            <p className={`text-xl sm:text-2xl font-bold mt-1 ${record.highlight ? "text-sb-gold" : "text-white"}`}>
              {record.value}
            </p>
          </LandingGlassCard>
        ))}
      </div>
    </SectionCard>
  );
}
