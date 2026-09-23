"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { DEFAULT_PAGE_SIZE, type PageMeta as ApiPageMeta } from "@pte/api-client";
import { Button } from "./Button";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

/** The pagination controls only need this structural subset of the API meta. */
export type PageMeta = Pick<ApiPageMeta, "page" | "size" | "totalElements" | "totalPages">;

interface PaginationControlsProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  onPageSizeChange?: (size: number) => void;
  showPageSizeInput?: boolean;
  showFirstLast?: boolean;
  pageSizeLabel?: string;
  firstLabel?: string;
  lastLabel?: string;
  totalItemsLabel?: ReactNode;
}

const PAGE_LABEL = "Page";

export const PaginationControls = ({
  meta,
  onPageChange,
  disabled = false,
  onPageSizeChange,
  showPageSizeInput = false,
  showFirstLast = false,
  pageSizeLabel = "Rows per page",
  firstLabel = "First",
  lastLabel = "Last",
  totalItemsLabel,
}: PaginationControlsProps): ReactElement => {
  const currentPageSize = meta.size > 0 ? meta.size : DEFAULT_PAGE_SIZE;
  const [pageSizeInput, setPageSizeInput] = useState(String(currentPageSize));
  const isFirst = meta.page <= 0;
  const isLast = meta.page >= meta.totalPages - 1;

  useEffect(() => {
    setPageSizeInput(String(currentPageSize));
  }, [currentPageSize]);

  const commitPageSize = (): void => {
    const nextPageSize = Number(pageSizeInput);
    if (!Number.isInteger(nextPageSize) || nextPageSize < 1) {
      setPageSizeInput(String(currentPageSize));
      return;
    }

    if (nextPageSize !== currentPageSize) onPageSizeChange?.(nextPageSize);
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm text-gray-600 sm:flex-row">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span>
          {PAGE_LABEL} {meta.page + 1} / {Math.max(meta.totalPages, 1)}
        </span>
        {totalItemsLabel}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {showPageSizeInput && onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>{pageSizeLabel}</span>
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              aria-label={pageSizeLabel}
              value={pageSizeInput}
              disabled={disabled}
              onChange={(event) => setPageSizeInput(event.target.value)}
              onBlur={commitPageSize}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
              className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-center text-sm text-gray-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </label>
        )}
        {showFirstLast && (
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={disabled || isFirst}
              onClick={() => onPageChange(0)}
            >
              {firstLabel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={disabled || isLast}
              onClick={() => onPageChange(Math.max(meta.totalPages - 1, 0))}
            >
              {lastLabel}
            </Button>
          </>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || isFirst}
            leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
            onClick={() => onPageChange(meta.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || isLast}
            rightIcon={<ChevronRightIcon className="h-4 w-4" />}
            onClick={() => onPageChange(meta.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
