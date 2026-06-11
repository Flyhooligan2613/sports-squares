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
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
        <p className="text-2xl font-bold text-slate-100">{claimed}</p>
        <p className="text-slate-500 text-xs mt-0.5">Claimed</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
        <p className="text-2xl font-bold text-green-400">{available}</p>
        <p className="text-slate-500 text-xs mt-0.5">Available</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
        <p className="text-2xl font-bold text-indigo-400">{selected}</p>
        <p className="text-slate-500 text-xs mt-0.5">Selected</p>
      </div>
    </div>
  );
}
