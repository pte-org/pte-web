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
  /**
   * Multi-row checkbox selection (Phase 12: Class merge/split needed this
   * first — kept generic since any future feature bulk-acting on table rows
   * will want the same capability). Omit all three props to keep the table
   * exactly as before; `selectedKeys`/`onSelectionChange` are required
   * together once `selectable` is true. Selection state is owned by the
   * caller (not this component), same as every other controlled input in
   * this package.
   */
  selectable?: boolean;
  selectedKeys?: ReadonlySet<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
  selectAllLabel?: string;
  selectRowLabel?: (row: TRow) => string;
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
  selectable = false,
  selectedKeys,
  onSelectionChange,
  selectAllLabel = "Select all rows",
  selectRowLabel = () => "Select row",
}: DataTableProps<TRow>): ReactElement {
  if (isLoading) return <LoadingState rows={4} />;

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const selection = selectedKeys ?? new Set<string | number>();
  const allSelected = selectable && rows.length > 0 && rows.every((row) => selection.has(getRowKey(row)));

  const toggleRow = (key: string | number): void => {
    if (!onSelectionChange) return;
    const next = new Set(selection);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const toggleAll = (): void => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? new Set() : new Set(rows.map(getRowKey)));
  };

  return (
    <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-md shadow-slate-200/70">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              {selectable && (
                <th scope="col" className="w-10 px-5 py-3.5">
                  <input
                    type="checkbox"
                    aria-label={selectAllLabel}
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
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
            {rows.map((row) => {
              const key = getRowKey(row);
              return (
                <tr key={key} className="hover:bg-slate-50/70">
                  {selectable && (
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        aria-label={selectRowLabel(row)}
                        checked={selection.has(key)}
                        onChange={() => toggleRow(key)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-5 py-4", column.className)}>
                      {column.cell(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-5 py-4 text-right">{rowActions(row)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
