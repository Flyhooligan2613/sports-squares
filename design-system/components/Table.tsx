import { cn } from "../utils/cn";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  getRowKey?: (row: T, index: number) => string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  className,
  getRowKey,
}: TableProps<T>) {
  return (
    <div className={cn("sqds-table-wrap", className)}>
      <table className="sqds-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={getRowKey?.(row, index) ?? String(index)}>
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
