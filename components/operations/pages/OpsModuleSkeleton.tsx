export default function OpsModuleSkeleton() {
  return (
    <div className="ops-page ops-module-skeleton" aria-busy="true" aria-label="Loading module">
      <div className="ops-skeleton-header">
        <span className="ops-skeleton-line ops-skeleton-line-sm" />
        <span className="ops-skeleton-line ops-skeleton-line-lg" />
        <span className="ops-skeleton-line ops-skeleton-line-md" />
      </div>
      <div className="ops-module-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ops-glass-card ops-skeleton-card">
            <span className="ops-skeleton-line ops-skeleton-line-md" />
            <span className="ops-skeleton-line ops-skeleton-line-full" />
            <span className="ops-skeleton-line ops-skeleton-line-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
