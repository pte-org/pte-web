"use client";

import type { ReactElement, ReactNode } from "react";
import { DEFAULT_PAGE_SIZE, type PageMeta as ApiPageMeta } from "@pte/api-client";
import { Pagination } from "./Pagination";
import { Select } from "./Select";
import { useLocale } from "../i18n";

/** The pagination controls only need this structural subset of the API meta. */
export type PageMeta = Pick<ApiPageMeta, "page" | "size" | "totalElements" | "totalPages">;

export interface PaginationPageSizeSelectProps {
  value: number;
  onChange: (size: number) => void;
  disabled?: boolean;
}

interface PaginationControlsProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  onPageSizeChange?: (size: number) => void;
  showPageSizeInput?: boolean;
  /** @deprecated The common pagination no longer renders separate first/last buttons. */
  showFirstLast?: boolean;
  /** @deprecated The common pagination no longer renders separate first/last buttons. */
  firstLabel?: string;
  /** @deprecated The common pagination no longer renders separate first/last buttons. */
  lastLabel?: string;
  totalItemsLabel?: ReactNode;
}

export const PaginationControls = ({
  meta,
  onPageChange,
  disabled = false,
  onPageSizeChange,
  showPageSizeInput = false,
}: PaginationControlsProps): ReactElement => {
  const { t } = useLocale();
  const currentPageSize = meta.size > 0 ? meta.size : DEFAULT_PAGE_SIZE;
  const totalItems = Math.max(meta.totalElements, 0);

  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm text-[var(--table-muted-text)] sm:flex-row">
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <Pagination
          currentPage={meta.page + 1}
          totalPages={meta.totalPages}
          disabled={disabled}
          onPageChange={(nextPage) => onPageChange(nextPage - 1)}
          sideLayout="icon"
          grouped
          className="!mx-0 !w-auto !justify-end gap-1"
        />
        {showPageSizeInput && onPageSizeChange && (
          <PaginationPageSizeSelect
            value={currentPageSize}
            onChange={onPageSizeChange}
            disabled={disabled}
          />
        )}
      </div>
      <span className="tabular-nums">
        {t("common.totalRecords", "Total {count} records", { count: totalItems })}
      </span>
    </div>
  );
};

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

export const PaginationPageSizeSelect = ({
  value,
  onChange,
  disabled = false,
}: PaginationPageSizeSelectProps): ReactElement => {
  const { t } = useLocale();
  const currentPageSize = Math.max(Math.trunc(value) || DEFAULT_PAGE_SIZE, 1);
  const options = [...PAGE_SIZE_OPTIONS, currentPageSize]
    .filter((option, index, values) => values.indexOf(option) === index)
    .map((option) => ({ label: String(option), value: String(option) }));

  return (
    <label className="flex items-center gap-2 whitespace-nowrap text-[var(--table-muted-text)]">
      <span>{t("common.perPage", "Per page")}</span>
      <Select
        aria-label={t("common.perPage", "Per page")}
        options={options}
        value={String(currentPageSize)}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        size="sm"
        variant="table"
        className="w-[64px]"
      />
    </label>
  );
};
