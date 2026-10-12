import type { ReactElement } from "react";
import { cn } from "../utils/cn";
import { Button } from "./Button";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { useLocale } from "../i18n";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  disabled?: boolean;
  className?: string;
  grouped?: boolean;
  sideLayout?: "full" | "label" | "icon";
}

const MAX_PAGES_SHOWN = 6;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
  grouped = false,
  sideLayout = "full",
}: PaginationProps): ReactElement | null {
  const { t } = useLocale();
  const pageCount = Math.max(totalPages, 1);
  const page = Math.min(Math.max(currentPage, 1), pageCount);
  const isFirst = page === 1;
  const isLast = page === pageCount;

  if (pageCount <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label={t("common.pagination", "Pagination")}
      className="w-full text-sm"
    >
      <ul
        className={cn(
          "mx-auto flex w-full items-center justify-center gap-1 text-[var(--ink-secondary)]",
          !grouped && "max-sm:gap-5",
          className,
        )}
      >
        <li className={cn(!grouped && "mr-auto")}>
          <PaginationSideButton
            direction="previous"
            disabled={disabled || isFirst}
            sideLayout={sideLayout}
            label={t("common.previous", "Previous")}
            onClick={() => onPageChange?.(page - 1)}
          />
        </li>

        <li className="sm:hidden">
          {t("common.pageOf", "Page {page} of {total}", { page, total: pageCount })}
        </li>

        <li className="hidden items-center gap-1 sm:flex">
          {buildPageItems(page, pageCount).map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${page}-${index}`}
                className="grid size-10 place-items-center"
                aria-hidden="true"
              >
                {String.fromCharCode(0x2026)}
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={t("common.goToPage", "Go to page {page}", { page: item })}
                aria-current={item === page ? "page" : undefined}
                disabled={disabled}
                onClick={() => onPageChange?.(item)}
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-lg border border-transparent text-sm transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 disabled:pointer-events-none disabled:opacity-50",
                  item === page &&
                    "border-[var(--shell-border)] bg-[var(--surface-subtle)] font-medium text-[var(--ink-primary)]",
                )}
              >
                {item}
              </button>
            ),
          )}
        </li>

        <li className={cn(!grouped && "ml-auto")}>
          <PaginationSideButton
            direction="next"
            disabled={disabled || isLast}
            sideLayout={sideLayout}
            label={t("common.next", "Next")}
            onClick={() => onPageChange?.(page + 1)}
          />
        </li>
      </ul>
    </nav>
  );
}

function PaginationSideButton({
  direction,
  disabled,
  sideLayout,
  label,
  onClick,
}: {
  direction: "previous" | "next";
  disabled: boolean;
  sideLayout: PaginationProps["sideLayout"];
  label: string;
  onClick: () => void;
}): ReactElement {
  const isPrevious = direction === "previous";
  const icon = isPrevious ? (
    <ChevronLeftIcon className="h-4 w-4 shrink-0" />
  ) : (
    <ChevronRightIcon className="h-4 w-4 shrink-0" />
  );

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "h-10",
        sideLayout === "icon" && "w-10 px-0",
        sideLayout === "label" && "px-4",
        sideLayout === "full" && "gap-2 px-3",
      )}
    >
      {isPrevious ? (
        icon
      ) : sideLayout !== "icon" ? (
        <span className="max-sm:hidden">{label}</span>
      ) : null}
      {isPrevious ? (
        sideLayout !== "icon" ? (
          <span className="max-sm:hidden">{label}</span>
        ) : null
      ) : (
        icon
      )}
    </Button>
  );
}

function buildPageItems(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= MAX_PAGES_SHOWN) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, "ellipsis", pageCount];
  if (page >= pageCount - 2)
    return [1, "ellipsis", pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount];
}
