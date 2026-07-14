import type { ReactElement } from "react";
import { Button } from "./Button";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface PaginationControlsProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const PAGE_LABEL = "Page";

export const PaginationControls = ({
  meta,
  onPageChange,
  disabled = false,
}: PaginationControlsProps): ReactElement => {
  const isFirst = meta.page <= 0;
  const isLast = meta.page >= meta.totalPages - 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm text-gray-600 sm:flex-row">
      <span>
        {PAGE_LABEL} {meta.page + 1} / {Math.max(meta.totalPages, 1)}
      </span>
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
  );
};
