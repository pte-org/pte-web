"use client";

import { useMemo, type ReactElement } from "react";
import type { MonitoringStudentResponse, PageMeta } from "@pte/api-client";
import {
  Badge,
  Button,
  DataTable,
  PaginationControls,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";

interface MonitoringStudentTableProps {
  students: MonitoringStudentResponse[];
  selectedStudentPublicId?: string | null;
  onSelectStudent: (student: MonitoringStudentResponse) => void;
  isLoading?: boolean;
  meta?: PageMeta;
  onPageChange?: (page: number) => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("vi-VN", {
    timeStyle: "medium",
  }).format(date);
}

function getStatusBadgeProps(status: string | null | undefined): { label: string; variant: "info" | "success" | "warning" | "neutral" } {
  switch (status) {
    case "IN_PROGRESS":
      return { label: "Đang thi", variant: "info" };
    case "SUBMITTED":
      return { label: "Đã nộp", variant: "success" };
    case "ABANDONED":
      return { label: "Bỏ dở", variant: "warning" };
    default:
      return { label: "Chưa thi", variant: "neutral" };
  }
}

export function MonitoringStudentTable({
  students,
  selectedStudentPublicId,
  onSelectStudent,
  isLoading = false,
  meta,
  onPageChange,
}: MonitoringStudentTableProps): ReactElement {
  const columns: DataTableColumn<MonitoringStudentResponse>[] = useMemo(
    () => [
      {
        key: "student",
        header: "Thí sinh",
        cell: (row) => {
          const isSelected = selectedStudentPublicId === row.studentPublicId;
          return (
            <div>
              <div className={`font-medium ${isSelected ? "text-blue-600 font-semibold" : "text-[var(--ink-primary)]"}`}>
                {row.displayName}
              </div>
              <div className="text-xs text-[var(--ink-muted)]">
                {row.email ?? "—"}
              </div>
            </div>
          );
        },
      },
      {
        key: "attempt",
        header: "Lượt thi",
        cell: (row) => (
          <span className="font-mono text-xs text-[var(--ink-secondary)]">
            {row.attemptNumber ? `#${row.attemptNumber}` : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        cell: (row) => {
          const { label, variant } = getStatusBadgeProps(row.status);
          return <StatusBadge label={label} variant={variant} />;
        },
      },
      {
        key: "startedAt",
        header: "Bắt đầu",
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">{formatTime(row.startedAt)}</span>
        ),
      },
      {
        key: "lastSeenAt",
        header: "Tín hiệu cuối",
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">{formatTime(row.lastSeenAt)}</span>
        ),
      },
      {
        key: "violations",
        header: "Vi phạm",
        cell: (row) =>
          row.manualViolationCount > 0 ? (
            <Badge variant="danger">{row.manualViolationCount}</Badge>
          ) : (
            <span className="text-[var(--ink-muted)] text-xs">—</span>
          ),
      },
    ],
    [selectedStudentPublicId],
  );

  return (
    <DataTable
      columns={columns}
      rows={students}
      getRowKey={(row) => row.studentPublicId}
      isLoading={isLoading}
      emptyTitle="Không có thí sinh nào trong danh sách phòng thi."
      clientSideFiltering={false}
      clientSideSorting={false}
      clientSidePagination={false}
      showSearch={false}
      rowActions={(row) => (
        <div className="flex justify-end">
          <Button
            variant={selectedStudentPublicId === row.studentPublicId ? "primary" : "secondary"}
            size="sm"
            onClick={() => onSelectStudent(row)}
          >
            Chi tiết
          </Button>
        </div>
      )}
      pagination={
        meta && meta.totalPages > 1 && onPageChange ? (
          <PaginationControls
            meta={meta}
            onPageChange={onPageChange}
            disabled={isLoading}
          />
        ) : null
      }
    />
  );
}
