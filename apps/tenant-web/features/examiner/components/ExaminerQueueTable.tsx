"use client";

import { useMemo, type ReactElement } from "react";
import type { ExaminerQueueItemResponse } from "@pte/api-client";
import { Badge, Button, DataTable, Pagination, type DataTableColumn } from "@pte/ui";
import type { ExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";
import { formatAttemptTitle } from "../utils/attemptLabels";

interface ExaminerQueueTableProps {
  items: ExaminerQueueItemResponse[];
  text: ExaminerWorkspaceText;
  isLoading: boolean;
  isFetching: boolean;
  emptyTitle: string;
  search: string;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  startingAttemptId: string | null;
  filters: ReactElement;
  onSearchChange: (value: string) => void;
  onStart: (item: ExaminerQueueItemResponse) => void;
  onOpen: (item: ExaminerQueueItemResponse) => void;
  onPageChange: (page: number) => void;
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function getBlockingText(text: ExaminerWorkspaceText, reason: string | null | undefined): string {
  if (!reason) return "";
  if (reason === "WAITING_FOR_HOST_FREEZE") return text.waitingForHostFreeze;
  if (reason === "CARRIED_OVER_DRAFTS_UNCONFIRMED") return text.carriedOverDrafts;
  return `${text.blockedReasonPrefix}${reason}`;
}

export const ExaminerQueueTable = ({
  items,
  text,
  isLoading,
  isFetching,
  emptyTitle,
  search,
  totalItems,
  currentPage,
  totalPages,
  startingAttemptId,
  filters,
  onSearchChange,
  onStart,
  onOpen,
  onPageChange,
}: ExaminerQueueTableProps): ReactElement => {
  const columns = useMemo<DataTableColumn<ExaminerQueueItemResponse>[]>(
    () => [
      {
        key: "attempt",
        header: text.attemptColumn,
        cell: (row) => (
          <div className="min-w-56">
            <p className="font-medium text-[var(--table-body-text)]">
              {formatAttemptTitle(text.attemptLabel, row)}
            </p>
            <p className="mt-1 text-xs text-[var(--table-muted-text)]">
              {text.sessionLabel}: {row.sessionPublicId}
            </p>
          </div>
        ),
        sortable: false,
      },
      {
        key: "progress",
        header: text.progressColumn,
        cell: (row) => (
          <span className="tabular-nums">
            {row.submittedAnswerCount}/{row.eligibleAnswerCount} {text.progressLabel.toLocaleLowerCase()}
          </span>
        ),
        sortable: false,
      },
      {
        key: "status",
        header: text.filterLabel,
        cell: (row) => {
          const blockingText = getBlockingText(text, row.blockingReason);
          return (
            <div>
              <Badge
                variant={
                  row.status === "PENDING"
                    ? "neutral"
                    : row.status === "IN_PROGRESS"
                      ? "warning"
                      : "success"
                }
              >
                {row.status === "PENDING"
                  ? text.statusPending
                  : row.status === "IN_PROGRESS"
                    ? text.statusInProgress
                    : text.statusCompleted}
              </Badge>
              {blockingText && (
                <p className="mt-1 max-w-56 text-xs font-medium text-[var(--cream-action)]">
                  {blockingText}
                </p>
              )}
            </div>
          );
        },
        sortable: false,
      },
      {
        key: "assignedAt",
        header: text.assignedColumn,
        cell: (row) => formatDate(row.assignedAt, text.locale),
        sortable: false,
      },
    ],
    [text],
  );

  return (
    <DataTable
      columns={columns}
      rows={items}
      getRowKey={(row) => `${row.sessionPublicId}:${row.attemptPublicId}`}
      isLoading={isLoading}
      emptyTitle={emptyTitle}
      rowActions={(row) => {
        const isZeroEligible = row.eligibleAnswerCount === 0;
        const isStarting = startingAttemptId === row.attemptPublicId;
        if (isZeroEligible) {
          return (
            <div className="flex items-center justify-end whitespace-nowrap">
              <span className="text-xs text-[var(--table-muted-text)]">{text.noEligibleWork}</span>
            </div>
          );
        }
        if (row.status === "PENDING") {
          return (
            <div className="flex items-center justify-end whitespace-nowrap">
              <Button
                variant="primary"
                size="sm"
                className="shrink-0 whitespace-nowrap"
                disabled={isStarting || isFetching}
                onClick={() => onStart(row)}
              >
                {isStarting ? text.startingWork : text.startMarking}
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-end whitespace-nowrap">
            <Button
              variant={row.status === "IN_PROGRESS" ? "primary" : "secondary"}
              size="sm"
              className="shrink-0 whitespace-nowrap"
              onClick={() => onOpen(row)}
            >
              {row.status === "IN_PROGRESS" ? text.continueMarking : text.viewWork}
            </Button>
          </div>
        );
      }}
      rowActionsHeader={text.actionsLabel}
      filters={filters}
      showSearch
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={text.searchPlaceholder}
      searchAriaLabel={text.searchPlaceholder}
      clientSideFiltering={false}
      clientSideSorting={false}
      clientSidePagination={false}
      pagination={
        <div className="flex flex-col gap-3 text-sm text-[var(--table-muted-text)] sm:flex-row sm:items-center sm:justify-between">
          <span className="tabular-nums">{text.format("totalRecords", { total: totalItems })}</span>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage + 1}
              totalPages={totalPages}
              onPageChange={(page) => onPageChange(page - 1)}
              sideLayout="icon"
              grouped
              className="!mx-0 !w-auto !justify-end gap-1"
            />
          )}
        </div>
      }
    />
  );
};
