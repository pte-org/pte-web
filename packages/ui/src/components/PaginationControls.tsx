import type { ReactElement, ReactNode } from "react";
import type { PageMeta as ApiPageMeta } from "@pte/api-client";
import { Button } from "./Button";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

/** The pagination controls only need this structural subset of the API meta. */
export type PageMeta = Pick<ApiPageMeta, "page" | "size" | "totalElements" | "totalPages">;

interface PaginationControlsProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
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
  pageSizeOptions = [20, 50, 100],
  onPageSizeChange,
  showPageSizeSelector = false,
  showFirstLast = false,
  pageSizeLabel = "Rows per page",
  firstLabel = "First",
  lastLabel = "Last",
  totalItemsLabel,
}: PaginationControlsProps): ReactElement => {
  const isFirst = meta.page <= 0;
  const isLast = meta.page >= meta.totalPages - 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm text-gray-600 sm:flex-row">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span>
          {PAGE_LABEL} {meta.page + 1} / {Math.max(meta.totalPages, 1)}
        </span>
        {totalItemsLabel}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {showPageSizeSelector && onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>{pageSizeLabel}</span>
            <select
              aria-label={pageSizeLabel}
              value={meta.size}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
