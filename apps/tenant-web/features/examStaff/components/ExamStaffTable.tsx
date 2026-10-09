"use client";

import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import { DataTable, type DataTableColumn } from "@pte/ui";
import type { ReactElement, ReactNode } from "react";

export interface ExamStaffTableColumn<TRow> extends DataTableColumn<TRow> {
  label: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface ExamStaffTableProps<TRow> {
  columns: ExamStaffTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  rowActions?: (row: TRow) => ReactNode;
  rowActionsHeader?: ReactNode;
  pageSizeLabel?: string;
}

export function ExamStaffTable<TRow>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyTitle = "No data",
  emptyDescription,
  rowActions,
  rowActionsHeader,
  pageSizeLabel = "Per page",
}: ExamStaffTableProps<TRow>): ReactElement {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={getRowKey}
      isLoading={isLoading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      rowActions={rowActions}
      rowActionsHeader={rowActionsHeader}
      showSearch
      clientSidePagination
      initialPageSize={DEFAULT_PAGE_SIZE}
      pageSizeLabel={pageSizeLabel}
      renderMobileRow={(row) => (
        <article className="space-y-3 px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
                {columns[0]?.label}
              </p>
              <div className="mt-1 truncate text-sm text-[var(--ink-primary)]">
                {columns[0]?.cell(row)}
              </div>
            </div>
            {rowActions && <div className="shrink-0">{rowActions(row)}</div>}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {columns.slice(1).map((column) => (
              <div key={column.key} className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
                  {column.label}
                </dt>
                <dd className="mt-1 truncate text-sm text-[var(--ink-primary)]">
                  {column.cell(row)}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      )}
    />
  );
}
