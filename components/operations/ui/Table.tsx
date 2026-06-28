interface TableColumn {
  key: string;
  label: string;
}

interface TableProps {
  title: string;
  subtitle?: string;
  columns?: TableColumn[];
  rows?: number;
  className?: string;
}

const DEFAULT_COLUMNS: TableColumn[] = [
  { key: "col1", label: "ID" },
  { key: "col2", label: "Name" },
  { key: "col3", label: "Status" },
  { key: "col4", label: "Updated" },
];

export default function Table({
  title,
  subtitle,
  columns = DEFAULT_COLUMNS,
  rows = 5,
  className = "",
}: TableProps) {
  return (
    <article className={`ops-glass-card ops-table-card ${className}`} aria-busy="true">
      <header className="ops-card-header">
        <div>
          <h3 className="ops-card-title">{title}</h3>
          {subtitle && <p className="ops-card-subtitle">{subtitle}</p>}
        </div>
        <span className="ops-badge ops-badge-muted">Preview</span>
      </header>
      <div className="ops-table-wrap">
        <table className="ops-table" aria-label={`${title} placeholder table`}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    <span
                      className="ops-skeleton-line"
                      style={{ width: `${60 + ((rowIdx + col.key.length) % 4) * 10}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
