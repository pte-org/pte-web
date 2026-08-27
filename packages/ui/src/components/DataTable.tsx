import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

export interface DataTableColumn<TRow> {
  key: string;
  header: ReactNode;
  cell: (row: TRow) => ReactNode;
  className?: string;
}

interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  rowActions?: (row: TRow) => ReactNode;
  rowActionsHeader?: ReactNode;
}

export function DataTable<TRow>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyTitle = "No data",
  emptyDescription,
  rowActions,
  rowActionsHeader,
}: DataTableProps<TRow>): ReactElement {
  if (isLoading) return <LoadingState rows={4} />;

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-md shadow-slate-200/70">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn("px-5 py-3.5", column.className)}
                >
                  {column.header}
                </th>
              ))}
              {rowActions && (
                <th scope="col" className="w-12 px-5 py-3.5 text-right">
                  {rowActionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-4", column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-5 py-4 text-right">{rowActions(row)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
