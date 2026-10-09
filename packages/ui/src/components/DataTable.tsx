"use client";

import {
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { Pagination } from "./Pagination";
import { Select, type SelectOption } from "./Select";
import { TableFilterInput, TableSearchControl } from "./TableFilters";

export interface DataTableColumn<TRow> {
  key: string;
  header: ReactNode;
  cell: (row: TRow) => ReactNode;
  label?: string;
  /** Render a shared sort control in the column header. Defaults to true. */
  sortable?: boolean;
  /** Value used by the common browser-side sort when no custom value is supplied. */
  sortAccessor?: (row: TRow) => DataTableSortValue;
  /** A custom control rendered in the common filter row. */
  filter?: ReactNode;
  /** Value used by the common browser-side filter when no custom control is supplied. */
  filterAccessor?: (row: TRow) => string | number | null | undefined;
  /** Renders a shared select filter instead of a text input for this column. */
  filterOptions?: readonly SelectOption[];
  filterPlaceholder?: string;
  filterable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  className?: string;
}

export type DataTableSortDirection = "asc" | "desc";

export type DataTableSortValue = string | number | boolean | Date | null | undefined;

export interface DataTableSortState {
  key: string;
  direction: DataTableSortDirection;
}

export interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  rowActions?: (row: TRow) => ReactNode;
  rowActionsHeader?: ReactNode;
  toolbar?: ReactNode;
  /**
   * Filter controls rendered in the common table toolbar. The caller owns
   * the filter state so this works for both client-side and server-side data.
   */
  filters?: ReactNode;
  /** Render the shared search control when the caller does not provide a toolbar. */
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  /** Apply the common search and column filters to the rows in the browser. */
  clientSideFiltering?: boolean;
  /** Apply the common column sort to the rows in the browser. */
  clientSideSorting?: boolean;
  /** Optional first sort applied by the common table. */
  initialSort?: DataTableSortState | null;
  /** Let the common table own page size, page slicing and footer pagination. */
  clientSidePagination?: boolean;
  initialPageSize?: number;
  pageSizeLabel?: string;
  mobileToolbar?: ReactNode;
  pagination?: ReactNode;
  renderMobileRow?: (row: TRow) => ReactNode;
  tableClassName?: string;
  tableWrapperClassName?: string;
  /**
   * Multi-row checkbox selection. Selection state stays controlled by the
   * caller so filtering and mutations can decide what a selected key means.
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
  toolbar,
  filters,
  showSearch = true,
  searchPlaceholder = "Search",
  searchAriaLabel = "Search table",
  clientSideFiltering = true,
  clientSideSorting = true,
  initialSort = null,
  clientSidePagination = false,
  initialPageSize = 10,
  pageSizeLabel = "Per page",
  mobileToolbar,
  pagination,
  renderMobileRow,
  tableClassName,
  tableWrapperClassName,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  selectAllLabel = "Select all rows",
  selectRowLabel = () => "Select row",
}: DataTableProps<TRow>): ReactElement {
  const selection = selectedKeys ?? new Set<string | number>();
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilterValues, setColumnFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<DataTableSortState | null>(initialSort);
  const [pageSize, setPageSize] = useState(Math.max(initialPageSize, 1));
  const [currentPage, setCurrentPage] = useState(1);
  const filterableColumns = columns.filter(
    (column) => column.filterable !== false && column.key.toLowerCase() !== "actions",
  );
  const hasColumnFilters = filterableColumns.length > 0;

  const filteredRows = useMemo(() => {
    if (!clientSideFiltering) return rows;

    const normalizedGlobalSearch = globalSearch.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const matchesGlobal =
        !normalizedGlobalSearch ||
        filterableColumns.some((column) =>
          getFilterText(column, row).toLocaleLowerCase().includes(normalizedGlobalSearch),
        );

      if (!matchesGlobal) return false;

      return filterableColumns.every((column) => {
        const query = columnFilterValues[column.key]?.trim().toLocaleLowerCase();
        return !query || getFilterText(column, row).toLocaleLowerCase().includes(query);
      });
    });
  }, [clientSideFiltering, columnFilterValues, filterableColumns, globalSearch, rows]);

  const sortedRows = useMemo(() => {
    if (!clientSideSorting || !sort) return filteredRows;

    const column = columns.find(
      (candidate) =>
        candidate.key === sort.key &&
        candidate.sortable !== false &&
        candidate.key.toLowerCase() !== "actions",
    );
    if (!column) return filteredRows;

    return filteredRows
      .map((row, index) => ({ row, index }))
      .sort((left, right) => {
        const comparison = compareSortValues(
          getSortValue(column, left.row),
          getSortValue(column, right.row),
        );
        return comparison === 0
          ? left.index - right.index
          : sort.direction === "asc"
            ? comparison
            : -comparison;
      })
      .map(({ row }) => row);
  }, [clientSideSorting, columns, filteredRows, sort]);

  const totalPages = Math.max(Math.ceil(filteredRows.length / pageSize), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleRows = clientSidePagination
    ? sortedRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)
    : sortedRows;
  const allSelected =
    selectable && visibleRows.length > 0 && visibleRows.every((row) => selection.has(getRowKey(row)));

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilterValues, globalSearch, rows.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const toggleRow = (key: string | number): void => {
    if (!onSelectionChange) return;
    const next = new Set(selection);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const toggleAll = (): void => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? new Set() : new Set(visibleRows.map(getRowKey)));
  };

  const toggleSort = (key: string): void => {
    setSort((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const cellPadding = "px-3 py-3 sm:px-5 sm:py-3.5";
  const cellPaddingBody = "px-3 py-3 sm:px-5 sm:py-4";
  const shellClassName =
    "overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] shadow-none motion-safe:animate-pte-fade-up";
  const hasBuiltInSearch = showSearch && !toolbar;
  const hasPageSizeControl = clientSidePagination;
  const hasToolbar = Boolean(toolbar || filters || hasBuiltInSearch || hasPageSizeControl);

  return (
    <div className={shellClassName}>
      {hasToolbar && (
        <div className="flex flex-col gap-3 border-b border-[var(--divider)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0 flex-1">
            {toolbar ??
              (hasBuiltInSearch ? (
                <TableSearchControl
                  ariaLabel={searchAriaLabel}
                  placeholder={searchPlaceholder}
                  value={globalSearch}
                  onChange={setGlobalSearch}
                  className="w-full sm:max-w-[280px]"
                />
              ) : null)}
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            {filters}
            {hasPageSizeControl && (
              <label className="flex items-center gap-2 text-sm text-[var(--ink-primary)]">
                <span>{pageSizeLabel}</span>
                <Select
                  aria-label={pageSizeLabel}
                  options={buildPageSizeOptions(pageSize)}
                  value={String(pageSize)}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  size="sm"
                  className="w-[64px]"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {mobileToolbar && (
        <div className="border-b border-[var(--divider)] px-4 py-4 sm:hidden">{mobileToolbar}</div>
      )}

      {isLoading ? (
        <LoadingState rows={4} variant="table" className="rounded-none border-0 shadow-none" />
      ) : (
        <>
          <div className={cn(renderMobileRow && "hidden sm:block", tableWrapperClassName)}>
            <div className="overflow-x-auto">
              <table
                className={cn(
                  "min-w-full border-separate border-spacing-0 text-left text-sm",
                  tableClassName,
                )}
              >
                <thead className="bg-[var(--surface-card)] text-left text-xs font-semibold tracking-wide text-[var(--ink-secondary)]">
                  <tr>
                    {selectable && (
                      <th scope="col" className={cn("w-10", cellPadding)}>
                        <input
                          type="checkbox"
                          aria-label={selectAllLabel}
                          checked={allSelected}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-[var(--control-border)] text-[var(--action)] focus:ring-[var(--brand)]"
                        />
                      </th>
                    )}
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={
                          column.sortable === false || column.key.toLowerCase() === "actions"
                            ? undefined
                            : sort?.key === column.key
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                        }
                        className={cn(
                          cellPadding,
                          "border-b border-[var(--divider)]",
                          column.headerClassName,
                          column.className,
                        )}
                      >
                        {renderColumnHeader({ column, sort, onSort: toggleSort })}
                      </th>
                    ))}
                    {rowActions && (
                      <th
                        scope="col"
                        className={cn(
                          "w-12 border-b border-[var(--divider)] text-right",
                          cellPadding,
                        )}
                      >
                        {rowActionsHeader}
                      </th>
                    )}
                  </tr>
                  {hasColumnFilters && (
                    <tr>
                      {selectable && (
                        <th
                          className={cn("border-b border-[var(--divider)]", cellPadding)}
                          aria-hidden="true"
                        />
                      )}
                      {columns.map((column) => (
                        <th
                          key={`${column.key}-filter`}
                          scope="col"
                          className={cn(
                            cellPadding,
                            "border-b border-[var(--divider)] font-normal normal-case tracking-normal text-[var(--ink-primary)]",
                            column.headerClassName,
                            column.className,
                          )}
                        >
                          {renderColumnFilter({
                            column,
                            value: columnFilterValues[column.key] ?? "",
                            onChange: (value) =>
                              setColumnFilterValues((current) => ({
                                ...current,
                                [column.key]: value,
                              })),
                          })}
                        </th>
                      ))}
                      {rowActions && (
                        <th
                          className={cn("w-12 border-b border-[var(--divider)]", cellPadding)}
                          aria-hidden="true"
                        />
                      )}
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-[var(--divider)] bg-[var(--surface-card)] text-[var(--ink-primary)]">
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                        className="px-4 py-0 sm:px-5"
                      >
                        <EmptyState
                          title={emptyTitle}
                          description={emptyDescription}
                          className="rounded-none border-0 px-6 py-10 shadow-none"
                        />
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row) => {
                      const key = getRowKey(row);
                      return (
                        <tr
                          key={key}
                          className="transition-colors duration-150 hover:bg-[var(--surface-row-hover)]"
                        >
                          {selectable && (
                            <td className={cellPaddingBody}>
                              <input
                                type="checkbox"
                                aria-label={selectRowLabel(row)}
                                checked={selection.has(key)}
                                onChange={() => toggleRow(key)}
                                className="h-4 w-4 rounded border-[var(--control-border)] text-[var(--action)] focus:ring-[var(--brand)]"
                              />
                            </td>
                          )}
                          {columns.map((column) => (
                            <td
                              key={column.key}
                              className={cn(
                                cellPaddingBody,
                                column.cellClassName,
                                column.className,
                              )}
                            >
                              {column.cell(row)}
                            </td>
                          ))}
                          {rowActions && (
                            <td className={cn("text-right", cellPaddingBody)}>{rowActions(row)}</td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {renderMobileRow && (
            <div className="divide-y divide-[var(--divider)] sm:hidden">
              {visibleRows.length === 0 ? (
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  className="rounded-none border-0 px-6 py-10 shadow-none"
                />
              ) : (
                visibleRows.map((row) => <div key={getRowKey(row)}>{renderMobileRow(row)}</div>)
              )}
            </div>
          )}
        </>
      )}

      {clientSidePagination ? (
        <div className="flex flex-col gap-3 border-t border-[var(--divider)] px-4 py-3 text-sm text-[var(--ink-secondary)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span>
            Showing {filteredRows.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1} to{" "}
            {Math.min(safeCurrentPage * pageSize, filteredRows.length)} of {filteredRows.length} records
          </span>
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            sideLayout="icon"
            grouped
            className="!mx-0 !w-auto !justify-end gap-1"
          />
        </div>
      ) : (
        pagination && <div className="border-t border-[var(--divider)] px-4 py-3 sm:px-5">{pagination}</div>
      )}
    </div>
  );
}

function renderColumnFilter<TRow>({
  column,
  value,
  onChange,
}: {
  column: DataTableColumn<TRow>;
  value: string;
  onChange: (value: string) => void;
}): ReactNode {
  if (column.filter !== undefined) return column.filter;
  if (column.filterable === false || column.key.toLowerCase() === "actions") return null;

  if (column.filterOptions) {
    return (
      <Select
        aria-label={`${column.label ?? "Column"} filter`}
        options={column.filterOptions}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="sm"
        className="min-w-[120px]"
      />
    );
  }

  return (
    <TableFilterInput
      ariaLabel={`${column.label ?? "Column"} filter`}
      placeholder={column.filterPlaceholder}
      value={value}
      onChange={onChange}
    />
  );
}

function renderColumnHeader<TRow>({
  column,
  sort,
  onSort,
}: {
  column: DataTableColumn<TRow>;
  sort: DataTableSortState | null;
  onSort: (key: string) => void;
}): ReactNode {
  if (column.sortable === false || column.key.toLowerCase() === "actions") {
    return column.header;
  }

  const direction = sort?.key === column.key ? sort.direction : null;
  const label = column.label ?? (typeof column.header === "string" ? column.header : column.key);

  return (
    <button
      type="button"
      aria-label={`Sort by ${label}`}
      onClick={() => onSort(column.key)}
      className="inline-flex items-center gap-1.5 rounded-sm text-inherit outline-none transition-colors hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
    >
      <span>{column.header}</span>
      <SortIndicator direction={direction} />
    </button>
  );
}

function SortIndicator({ direction }: { direction: DataTableSortDirection | null }): ReactElement {
  return (
    <svg
      viewBox="0 0 10 14"
      className="h-3.5 w-2.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="m2 5 3-3 3 3"
        className={direction === "asc" ? "text-[var(--action)]" : "text-[var(--ink-muted)]"}
      />
      <path
        d="m2 9 3 3 3-3"
        className={direction === "desc" ? "text-[var(--action)]" : "text-[var(--ink-muted)]"}
      />
    </svg>
  );
}

function getFilterText<TRow>(column: DataTableColumn<TRow>, row: TRow): string {
  const value = column.filterAccessor?.(row);
  if (value !== undefined && value !== null) return String(value);
  return reactNodeToText(column.cell(row));
}

function getSortValue<TRow>(column: DataTableColumn<TRow>, row: TRow): DataTableSortValue {
  if (column.sortAccessor) return column.sortAccessor(row);
  if (column.filterAccessor) return column.filterAccessor(row);
  return reactNodeToText(column.cell(row));
}

function compareSortValues(left: DataTableSortValue, right: DataTableSortValue): number {
  if (left === null || left === undefined) return right === null || right === undefined ? 0 : 1;
  if (right === null || right === undefined) return -1;

  if (left instanceof Date || right instanceof Date) {
    const leftTime = left instanceof Date ? left.getTime() : new Date(String(left)).getTime();
    const rightTime = right instanceof Date ? right.getTime() : new Date(String(right)).getTime();
    if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) return leftTime - rightTime;
  }

  if (typeof left === "number" && typeof right === "number") return left - right;
  if (typeof left === "boolean" && typeof right === "boolean") return Number(left) - Number(right);

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function reactNodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeToText).join(" ");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return reactNodeToText(props.children);
  }
  return "";
}

function buildPageSizeOptions(currentPageSize: number): SelectOption[] {
  const values = [10, 25, 50, 100];
  if (!values.includes(currentPageSize)) values.push(currentPageSize);
  return values
    .sort((left, right) => left - right)
    .map((value) => ({ label: String(value), value: String(value) }));
}
