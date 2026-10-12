"use client";

import type { ReactElement } from "react";
import { Badge, Button, Skeleton, StatusBadge } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";

interface AttendanceRosterTableProps {
  rows: AttendanceRowResponse[];
  isLoading: boolean;
  canEditSession: boolean;
  onRecordAttendance: (row: AttendanceRowResponse, targetStatus: AttendanceStatus) => void;
  onViewHistory: (row: AttendanceRowResponse) => void;
}

const getStatusBadgeVariant = (status: AttendanceStatus) => {
  switch (status) {
    case "PRESENT":
      return "success";
    case "ABSENT":
      return "danger";
    case "UNMARKED":
    default:
      return "neutral";
  }
};

const getStatusLabel = (status: AttendanceStatus) => {
  switch (status) {
    case "PRESENT":
      return "Có mặt";
    case "ABSENT":
      return "Vắng mặt";
    case "UNMARKED":
    default:
      return "Chưa điểm danh";
  }
};

export function AttendanceRosterTable({
  rows,
  isLoading,
  canEditSession,
  onRecordAttendance,
  onViewHistory,
}: AttendanceRosterTableProps): ReactElement {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-8 text-center text-[var(--ink-muted)]">
        Không có dữ liệu thí sinh phù hợp.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--ink-secondary)] uppercase">
            <tr>
              <th className="px-4 py-3">Thí sinh</th>
              <th className="px-4 py-3">Điểm danh</th>
              <th className="px-4 py-3">Hoạt động bài thi</th>
              <th className="px-4 py-3">Cập nhật gần nhất</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {rows.map((row) => {
              const canEditRow = canEditSession && row.canEdit;

              return (
                <tr key={row.studentPublicId} className="hover:bg-[var(--surface-subtle)]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--ink-primary)]">
                      {row.displayName || row.studentPublicId}
                    </div>
                    {row.email && (
                      <div className="text-xs text-[var(--ink-secondary)]">{row.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={getStatusLabel(row.status)}
                      variant={getStatusBadgeVariant(row.status)}
                    />
                    {!canEditRow && row.blockingReason && (
                      <div className="mt-1 text-[11px] text-[var(--ink-muted)]">
                        {row.blockingReason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.latestAttemptActivityStatus ? (
                      <div>
                        <Badge variant="info">{row.latestAttemptActivityStatus}</Badge>
                        {row.latestAttemptActivityAt && (
                          <div className="mt-1 text-[11px] text-[var(--ink-muted)]">
                            {new Date(row.latestAttemptActivityAt).toLocaleTimeString("vi-VN")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--ink-muted)]">Chưa bắt đầu</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ink-secondary)]">
                    {row.lastActionAt ? (
                      <div>
                        <div>{new Date(row.lastActionAt).toLocaleString("vi-VN")}</div>
                        {row.lastActorRole && (
                          <div className="text-[11px] text-[var(--ink-muted)]">
                            Bởi: {row.lastActorRole}
                          </div>
                        )}
                        {row.lastReasonOrNote && (
                          <div
                            className="mt-0.5 max-w-xs truncate text-[11px] text-[var(--ink-muted)]"
                            title={row.lastReasonOrNote}
                          >
                            &ldquo;{row.lastReasonOrNote}&rdquo;
                          </div>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {canEditRow && row.status !== "PRESENT" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                          onClick={() => onRecordAttendance(row, "PRESENT")}
                        >
                          Có mặt
                        </Button>
                      )}
                      {canEditRow && row.status !== "ABSENT" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={() => onRecordAttendance(row, "ABSENT")}
                        >
                          Vắng mặt
                        </Button>
                      )}
                      {canEditRow && row.status !== "UNMARKED" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs text-[var(--ink-muted)] hover:bg-[var(--surface-subtle)]"
                          onClick={() => onRecordAttendance(row, "UNMARKED")}
                        >
                          Đặt lại
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        onClick={() => onViewHistory(row)}
                      >
                        Lịch sử
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
