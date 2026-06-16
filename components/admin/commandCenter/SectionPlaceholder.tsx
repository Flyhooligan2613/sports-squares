import LandingGlassCard from "@/components/landing/LandingGlassCard";

interface SectionPlaceholderProps {
  title: string;
  description: string;
  deferred?: string[];
}

export default function SectionPlaceholder({
  title,
  description,
  deferred = [],
}: SectionPlaceholderProps) {
  return (
    <LandingGlassCard className="p-6 sm:p-8 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-sb-muted mt-1">{description}</p>
      </div>
      {deferred.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2">
            Deferred integrations
          </p>
          <ul className="text-sm text-sb-muted space-y-1 list-disc list-inside">
            {deferred.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </LandingGlassCard>
  );
}
