interface AdminStatCardProps {
  label: string;
  value: number;
  accent?: "indigo" | "green" | "amber" | "purple";
}

const ACCENTS = {
  indigo: "text-indigo-400",
  green: "text-green-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
};

export default function AdminStatCard({
  label,
  value,
  accent = "indigo",
}: AdminStatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 admin-stat-enter">
      <p className={`text-3xl font-bold ${ACCENTS[accent]}`}>{value}</p>
      <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  );
}
