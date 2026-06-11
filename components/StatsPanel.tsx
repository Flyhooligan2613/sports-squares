import KpiCard from "@/components/ui/KpiCard";

interface StatsPanelProps {
  claimed: number;
  available: number;
  selected: number;
}

export default function StatsPanel({
  claimed,
  available,
  selected,
}: StatsPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <KpiCard label="Claimed" value={claimed} accent="muted" delay={0} />
      <KpiCard label="Available" value={available} accent="success" delay={60} />
      <KpiCard label="Selected" value={selected} accent="purple" delay={120} />
    </div>
  );
}
