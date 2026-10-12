"use client";

import { useMemo, type ReactElement } from "react";
import { ActionMenu, Badge, Button, DataTable, StatusBadge, type DataTableColumn } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus, IdentityVerificationStatus } from "@pte/api-client";

interface AttendanceRosterTableProps {
  rows: AttendanceRowResponse[];
  isLoading: boolean;
  canEditSession: boolean;
  onRecordAttendance: (row: AttendanceRowResponse, targetStatus: AttendanceStatus) => void;
  onViewHistory: (row: AttendanceRowResponse) => void;
  onVerifyIdentity?: (row: AttendanceRowResponse) => void;
}

const getAttendanceBadgeVariant = (status: AttendanceStatus): "success" | "warning" | "danger" | "neutral" => {
  switch (status) {
    case "PRESENT":
      return "success";
    case "LATE":
      return "warning";
    case "ABSENT":
      return "danger";
    case "UNMARKED":
    default:
      return "neutral";
  }
};

const getAttendanceLabel = (status: AttendanceStatus): string => {
  switch (status) {
    case "PRESENT":
      return "Có mặt";
    case "LATE":
      return "Đến trễ";
    case "ABSENT":
      return "Vắng mặt";
    case "UNMARKED":
    default:
      return "Chưa điểm danh";
  }
};

const getIdentityBadgeProps = (status: IdentityVerificationStatus = "UNVERIFIED"): {
  label: string;
  variant: "success" | "danger" | "neutral";
} => {
  switch (status) {
    case "VERIFIED":
      return { label: "Đã xác minh", variant: "success" };
    case "FAILED":
      return { label: "Nghi vấn", variant: "danger" };
    case "UNVERIFIED":
    default:
      return { label: "Chưa xác minh", variant: "neutral" };
  }
};

export function AttendanceRosterTable({
  rows,
  isLoading,
  canEditSession,
  onRecordAttendance,
  onViewHistory,
  onVerifyIdentity,
}: AttendanceRosterTableProps): ReactElement {
  const columns: DataTableColumn<AttendanceRowResponse>[] = useMemo(
    () => [
      {
        key: "student",
        header: "Thí sinh",
        cell: (row) => (
          <div>
            <div className="font-medium text-[var(--ink-primary)]">
              {row.displayName || row.studentPublicId}
            </div>
            {row.email && (
              <div className="text-xs text-[var(--ink-muted)]">{row.email}</div>
            )}
          </div>
        ),
      },
      {
        key: "attendance",
        header: "Điểm danh",
        cell: (row) => {
          const canEditRow = canEditSession && row.canEdit;
          return (
            <div>
              <StatusBadge
                label={getAttendanceLabel(row.status)}
                variant={getAttendanceBadgeVariant(row.status)}
              />
              {!canEditRow && row.blockingReason && (
                <div className="mt-1 text-[11px] text-[var(--ink-muted)]">
                  {row.blockingReason}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "identity",
        header: "Xác minh danh tính",
        cell: (row) => {
          const { label, variant } = getIdentityBadgeProps(row.identityStatus);
          return (
            <div>
              <StatusBadge label={label} variant={variant} />
              {row.identityNote && (
                <div className="mt-0.5 max-w-[160px] truncate text-[11px] text-[var(--ink-muted)]" title={row.identityNote}>
                  {row.identityNote}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "activity",
        header: "Hoạt động bài thi",
        cell: (row) =>
          row.latestAttemptActivityStatus ? (
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
          ),
      },
      {
        key: "lastAction",
        header: "Cập nhật gần nhất",
        cell: (row) =>
          row.lastActionAt ? (
            <div className="text-xs text-[var(--ink-secondary)]">
              <div>{new Date(row.lastActionAt).toLocaleString("vi-VN")}</div>
              {row.lastActorRole && (
                <div className="text-[11px] text-[var(--ink-muted)]">
                  Bởi: {row.lastActorRole}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">—</span>
          ),
      },
    ],
    [canEditSession],
  );

  const renderRowActions = (row: AttendanceRowResponse) => {
    const canEditRow = canEditSession && row.canEdit;

    const actionItems = [];
    if (canEditRow && row.status !== "PRESENT") {
      actionItems.push({
        label: "Có mặt",
        onClick: () => onRecordAttendance(row, "PRESENT"),
      });
    }
    if (canEditRow && row.status !== "LATE") {
      actionItems.push({
        label: "Đến trễ",
        onClick: () => onRecordAttendance(row, "LATE"),
      });
    }
    if (canEditRow && row.status !== "ABSENT") {
      actionItems.push({
        label: "Vắng mặt",
        onClick: () => onRecordAttendance(row, "ABSENT"),
      });
    }
    if (canEditRow && row.status !== "UNMARKED") {
      actionItems.push({
        label: "Đặt lại",
        onClick: () => onRecordAttendance(row, "UNMARKED"),
      });
    }
    if (onVerifyIdentity) {
      actionItems.push({
        label: "Xác minh danh tính",
        onClick: () => onVerifyIdentity(row),
      });
    }
    actionItems.push({
      label: "Lịch sử điểm danh",
      onClick: () => onViewHistory(row),
    });

    return (
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
        {canEditRow && row.status !== "LATE" && (
          <Button
            variant="secondary"
            size="sm"
            className="text-xs text-amber-700 hover:bg-amber-50 hover:text-amber-800"
            onClick={() => onRecordAttendance(row, "LATE")}
          >
            Đến trễ
          </Button>
        )}
        <ActionMenu items={actionItems} label="Thao tác điểm danh" />
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.studentPublicId}
      isLoading={isLoading}
      emptyTitle="Không có dữ liệu thí sinh phù hợp."
      rowActions={renderRowActions}
      clientSideFiltering={false}
      clientSideSorting={false}
      clientSidePagination={false}
      showSearch={false}
    />
  );
}
