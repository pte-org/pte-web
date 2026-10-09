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
import { useLocale } from "../i18n";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { Pagination } from "./Pagination";
import { PaginationPageSizeSelect } from "./PaginationControls";
import { DateRangePicker, type DateRangeValue } from "./DateRangePicker";
import { NextAdminAltArrowDownIcon, NextAdminAltArrowUpIcon } from "./nextAdminIcons";
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
  filterAccessor?: (row: TRow) => string | number | Date | null | undefined;
  /** Renders a shared select filter instead of a text input for this column. */
  filterOptions?: readonly SelectOption[];
  /** Renders the shared date-range filter and compares the accessor as a date. */
  filterType?: DataTableFilterType;
  filterPlaceholder?: string;
  filterable?: boolean;
  headerClassName?: string;
  /** Extra styles for body cells only. Use headerClassName for header/filter cells. */
  cellClassName?: string;
  /** Legacy alias for body-cell styling; it is not applied to the table header. */
  className?: string;
}

export type DataTableSortDirection = "asc" | "desc";

export type DataTableSortValue = string | number | boolean | Date | null | undefined;
export type DataTableFilterType = "text" | "select" | "date-range";
export type DataTableFilterValue = string | DateRangeValue;

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
  /** Actions rendered on the right side of the common table toolbar. */
  toolbarActions?: ReactNode;
  /** Apply the common search and column filters to the rows in the browser. */
  clientSideFiltering?: boolean;
  /** Apply the common column sort to the rows in the browser. */
  clientSideSorting?: boolean;
  /** Optional first sort applied by the common table. */
  initialSort?: DataTableSortState | null;
  /** Let the common table own page size, page slicing and footer pagination. */
  clientSidePagination?: boolean;
  initialPageSize?: number;
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
  emptyTitle,
  emptyDescription,
  rowActions,
  rowActionsHeader,
  toolbar,
  filters,
  showSearch = true,
  searchPlaceholder,
  searchAriaLabel,
  toolbarActions,
  clientSideFiltering = true,
  clientSideSorting = true,
  initialSort = null,
  clientSidePagination = true,
  initialPageSize = 10,
  mobileToolbar,
  pagination,
  renderMobileRow,
  tableClassName,
  tableWrapperClassName,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  selectAllLabel,
  selectRowLabel,
}: DataTableProps<TRow>): ReactElement {
  const { t } = useLocale();
  const resolvedEmptyTitle = emptyTitle ?? t("common.noData", "No data");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("common.search", "Search");
  const resolvedSearchAriaLabel = searchAriaLabel ?? t("common.searchTable", "Search table");
  const resolvedSelectAllLabel = selectAllLabel ?? t("common.selectAllRows", "Select all rows");
  const resolvedSelectRowLabel = selectRowLabel ?? (() => t("common.selectRow", "Select row"));
  const resolvedDateRangePlaceholder = t("common.dateRange", "Date range");
  const selection = selectedKeys ?? new Set<string | number>();
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilterValues, setColumnFilterValues] = useState<
    Record<string, DataTableFilterValue>
  >({});
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

      return filterableColumns.every((column) =>
        matchesColumnFilter(column, columnFilterValues[column.key], row),
      );
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
    selectable &&
    visibleRows.length > 0 &&
    visibleRows.every((row) => selection.has(getRowKey(row)));

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

  const cellPadding = "px-4 py-2.5 sm:px-6";
  const filterCellPadding = "px-4 pt-0 pb-2.5 sm:px-6";
  const cellPaddingBody = "px-4 py-3 sm:px-6 sm:py-3.5";
  const shellClassName =
    "overflow-hidden rounded-xl border-[0.5px] border-[var(--table-border)] bg-[var(--table-surface-background)] shadow-none motion-safe:animate-pte-fade-up";
  const hasBuiltInSearch = showSearch && !toolbar;
  const hasPageSizeControl = clientSidePagination && filteredRows.length > 10;
  const hasToolbar = Boolean(toolbar || filters || hasBuiltInSearch || toolbarActions);
  const actionsHeader = rowActionsHeader || t("common.actions", "Actions");

  return (
    <div className={shellClassName}>
      {hasToolbar && (
        <div className="flex flex-col gap-3 border-b border-[var(--table-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0 flex-1">
            {toolbar ??
              (hasBuiltInSearch ? (
                <TableSearchControl
                  ariaLabel={resolvedSearchAriaLabel}
                  placeholder={resolvedSearchPlaceholder}
                  value={globalSearch}
                  onChange={setGlobalSearch}
                  variant="table"
                  className="w-full sm:max-w-[280px]"
                />
              ) : null)}
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            {filters}
            {toolbarActions}
          </div>
        </div>
      )}

      {mobileToolbar && (
        <div className="border-b border-[var(--table-border)] px-4 py-4 sm:hidden">
          {mobileToolbar}
        </div>
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
                <thead className="bg-[var(--table-surface-background)] text-left text-xs leading-4 font-semibold tracking-normal text-[var(--table-header-text)]">
                  <tr className="bg-[var(--table-surface-background)]">
                    {selectable && (
                      <th scope="col" className={cn("w-10", cellPadding)}>
                        <input
                          type="checkbox"
                          aria-label={resolvedSelectAllLabel}
                          checked={allSelected}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-[var(--table-control-border)] text-[var(--action)] focus:ring-[var(--brand)]"
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
                          !hasColumnFilters && "border-b border-[var(--table-border)]",
                          column.headerClassName,
                        )}
                      >
                        {renderColumnHeader({
                          column,
                          sort,
                          onSort: toggleSort,
                          sortLabelPrefix: t("common.sortBy", "Sort by {label}"),
                        })}
                      </th>
                    ))}
                    {rowActions && (
                      <th
                        scope="col"
                        className={cn(
                          "w-12 text-right",
                          !hasColumnFilters && "border-b border-[var(--table-border)]",
                          cellPadding,
                        )}
                      >
                        {actionsHeader}
                      </th>
                    )}
                  </tr>
                  {hasColumnFilters && (
                    <tr className="bg-[var(--table-surface-background)]">
                      {selectable && (
                        <th
                          className={cn("border-b border-[var(--table-border)]", filterCellPadding)}
                          aria-hidden="true"
                        />
                      )}
                      {columns.map((column) => (
                        <th
                          key={`${column.key}-filter`}
                          scope="col"
                          className={cn(
                            filterCellPadding,
                            "border-b border-[var(--table-border)] font-normal normal-case tracking-normal text-[var(--table-body-text)]",
                            column.headerClassName,
                          )}
                        >
                          {renderColumnFilter({
                            column,
                            value:
                              columnFilterValues[column.key] ??
                              (column.filterType === "date-range" ? EMPTY_DATE_RANGE : ""),
                            onChange: (value) =>
                              setColumnFilterValues((current) => ({
                                ...current,
                                [column.key]: value,
                              })),
                            filterLabel: t("common.filter", "filter"),
                            dateRangePlaceholder: resolvedDateRangePlaceholder,
                          })}
                        </th>
                      ))}
                      {rowActions && (
                        <th
                          className={cn(
                            "w-12 border-b border-[var(--table-border)]",
                            filterCellPadding,
                          )}
                          aria-hidden="true"
                        />
                      )}
                    </tr>
                  )}
                </thead>
                <tbody className="bg-[var(--table-surface-background)] text-[var(--table-body-text)]">
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                        className="px-4 py-0 sm:px-5"
                      >
                        <EmptyState
                          title={resolvedEmptyTitle}
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
                          className="not-last:*:border-[var(--table-border)] not-last:[&>td]:border-b not-last:[&>th]:border-b transition-colors duration-150 hover:bg-[var(--table-row-hover)]"
                        >
                          {selectable && (
                            <td className={cellPaddingBody}>
                              <input
                                type="checkbox"
                                aria-label={resolvedSelectRowLabel(row)}
                                checked={selection.has(key)}
                                onChange={() => toggleRow(key)}
                                className="h-4 w-4 rounded border-[var(--table-control-border)] text-[var(--action)] focus:ring-[var(--brand)]"
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
            <div className="divide-y divide-[var(--table-border)] sm:hidden">
              {visibleRows.length === 0 ? (
                <EmptyState
                  title={resolvedEmptyTitle}
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
        <div className="flex flex-col gap-3 border-t border-[var(--table-border)] px-4 py-3 text-sm text-[var(--table-muted-text)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              sideLayout="icon"
              grouped
              className="!mx-0 !w-auto !justify-end gap-1"
            />
            {hasPageSizeControl && (
              <PaginationPageSizeSelect
                value={pageSize}
                onChange={(nextPageSize) => {
                  setPageSize(nextPageSize);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
          <span>
            {t("common.totalRecords", "Total {count} records", { count: filteredRows.length })}
          </span>
        </div>
      ) : (
        pagination && (
          <div className="border-t border-[var(--table-border)] px-4 py-3 sm:px-5">
            {pagination}
          </div>
        )
      )}
    </div>
  );
}

function renderColumnFilter<TRow>({
  column,
  value,
  onChange,
  filterLabel,
  dateRangePlaceholder,
}: {
  column: DataTableColumn<TRow>;
  value: DataTableFilterValue;
  onChange: (value: DataTableFilterValue) => void;
  filterLabel: string;
  dateRangePlaceholder: string;
}): ReactNode {
  if (column.filter !== undefined) return column.filter;
  if (column.filterable === false || column.key.toLowerCase() === "actions") return null;

  if (column.filterType === "date-range") {
    return (
      <DateRangePicker
        ariaLabel={`${getColumnLabel(column)} ${filterLabel}`}
        value={isDateRangeValue(value) ? value : EMPTY_DATE_RANGE}
        onChange={onChange}
        placeholder={column.filterPlaceholder ?? dateRangePlaceholder}
        variant="table"
      />
    );
  }

  const textValue = typeof value === "string" ? value : "";

  if (column.filterOptions) {
    return (
      <Select
        aria-label={`${getColumnLabel(column)} ${filterLabel}`}
        options={column.filterOptions}
        value={textValue}
        onChange={(event) => onChange(event.target.value)}
        size="sm"
        variant="table"
        className="min-w-[120px]"
      />
    );
  }

  return (
    <TableFilterInput
      ariaLabel={`${getColumnLabel(column)} ${filterLabel}`}
      placeholder={column.filterPlaceholder}
      value={textValue}
      onChange={onChange}
      variant="table"
    />
  );
}

function getColumnLabel<TRow>(column: DataTableColumn<TRow>): string {
  return column.label ?? (typeof column.header === "string" ? column.header : column.key);
}

const EMPTY_DATE_RANGE: DateRangeValue = { from: "", to: "" };

function isDateRangeValue(value: DataTableFilterValue | undefined): value is DateRangeValue {
  return typeof value === "object" && value !== null && "from" in value && "to" in value;
}

function matchesColumnFilter<TRow>(
  column: DataTableColumn<TRow>,
  value: DataTableFilterValue | undefined,
  row: TRow,
): boolean {
  if (column.filterType === "date-range") {
    return matchesDateRange(column, isDateRangeValue(value) ? value : EMPTY_DATE_RANGE, row);
  }

  const query = typeof value === "string" ? value.trim().toLocaleLowerCase() : "";
  return !query || getFilterText(column, row).toLocaleLowerCase().includes(query);
}

function matchesDateRange<TRow>(
  column: DataTableColumn<TRow>,
  range: DateRangeValue,
  row: TRow,
): boolean {
  if (!range.from && !range.to) return true;

  const from = range.from ? parseDateBoundary(range.from, false) : null;
  const to = range.to ? parseDateBoundary(range.to, true) : null;
  if ((range.from && from === null) || (range.to && to === null)) return false;
  if (from !== null && to !== null && from > to) return true;

  const value = column.filterAccessor?.(row) ?? getFilterText(column, row);
  const timestamp = toDateTimestamp(value);
  if (timestamp === null) return false;
  if (from !== null && timestamp < from) return false;
  if (to !== null && timestamp > to) return false;
  return true;
}

function parseDateBoundary(value: string, endOfDay: boolean): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  );
  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? date.getTime()
    : null;
}

function toDateTimestamp(value: string | number | Date | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.test(value)
    ? parseDateBoundary(value, false)
    : Date.parse(value);
  return dateOnly !== null && Number.isFinite(dateOnly) ? dateOnly : null;
}

function renderColumnHeader<TRow>({
  column,
  sort,
  onSort,
  sortLabelPrefix,
}: {
  column: DataTableColumn<TRow>;
  sort: DataTableSortState | null;
  onSort: (key: string) => void;
  sortLabelPrefix: string;
}): ReactNode {
  if (column.sortable === false || column.key.toLowerCase() === "actions") {
    return column.header;
  }

  const direction = sort?.key === column.key ? sort.direction : null;
  const label = column.label ?? (typeof column.header === "string" ? column.header : column.key);

  return (
    <button
      type="button"
      aria-label={sortLabelPrefix.replace("{label}", label)}
      onClick={() => onSort(column.key)}
      className="inline-flex items-center gap-1 rounded-sm text-inherit outline-none transition-colors hover:text-[var(--table-body-text)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
    >
      <span>{column.header}</span>
      <SortIndicator direction={direction} />
    </button>
  );
}

function SortIndicator({ direction }: { direction: DataTableSortDirection | null }): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 flex-col items-center justify-center -space-y-1"
    >
      <NextAdminAltArrowUpIcon
        className={cn(
          "h-2.5 w-2.5",
          direction === "asc" ? "text-[var(--action)]" : "text-[var(--table-muted-text)]",
        )}
      />
      <NextAdminAltArrowDownIcon
        className={cn(
          "h-2.5 w-2.5",
          direction === "desc" ? "text-[var(--action)]" : "text-[var(--table-muted-text)]",
        )}
      />
    </span>
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
