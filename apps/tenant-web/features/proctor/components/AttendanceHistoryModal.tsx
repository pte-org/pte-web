"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Badge, Button, DataTable, Modal, PaginationControls, StatusBadge, type DataTableColumn } from "@pte/ui";
import type { AttendanceHistoryItemResponse, AttendanceStatus } from "@pte/api-client";
import { useAttendanceHistory, useHostAttendanceHistory } from "../api";

interface AttendanceHistoryModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
  studentPublicId: string | null;
  studentName?: string | null;
  studentEmail?: string | null;
  isHost?: boolean;
}

const getStatusBadgeVariant = (status: AttendanceStatus): "success" | "warning" | "danger" | "neutral" => {
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

const getStatusLabel = (status: AttendanceStatus): string => {
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

export function AttendanceHistoryModal({
  open,
  onClose,
  sessionPublicId,
  studentPublicId,
  studentName,
  studentEmail,
  isHost = false,
}: AttendanceHistoryModalProps): ReactElement {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (open) {
      setPage(0);
    }
  }, [open, studentPublicId]);

  const proctorQuery = useAttendanceHistory(
    open && !isHost ? sessionPublicId : "",
    open && !isHost ? (studentPublicId ?? "") : "",
    page,
    20,
  );
  const hostQuery = useHostAttendanceHistory(
    open && isHost ? sessionPublicId : "",
    open && isHost ? (studentPublicId ?? "") : "",
    page,
    20,
  );

  const query = isHost ? hostQuery : proctorQuery;
  const { data, isLoading, isError, refetch } = query;
  const historyItems = data?.data ?? [];
  const meta = data?.meta;

  const columns: DataTableColumn<AttendanceHistoryItemResponse>[] = useMemo(
    () => [
      {
        key: "time",
        header: "Thời gian",
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">
            {new Date(row.serverActionAt).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "actor",
        header: "Người thực hiện",
        cell: (row) => (
          <div>
            <div className="font-medium text-xs text-[var(--ink-primary)]">
              {row.actorDisplayName || row.actorPublicId}
            </div>
            <Badge variant="neutral" className="mt-0.5 text-[10px]">
              {row.actorRole}
            </Badge>
          </div>
        ),
      },
      {
        key: "change",
        header: "Thay đổi",
        cell: (row) => (
          <div className="flex items-center gap-1.5">
            <StatusBadge
              label={getStatusLabel(row.previousStatus)}
              variant={getStatusBadgeVariant(row.previousStatus)}
            />
            <span className="text-[var(--ink-muted)]">→</span>
            <StatusBadge
              label={getStatusLabel(row.newStatus)}
              variant={getStatusBadgeVariant(row.newStatus)}
            />
          </div>
        ),
      },
      {
        key: "reason",
        header: "Lý do / Ghi chú",
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">
            {row.reasonOrNote || "—"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Lịch sử điểm danh: ${studentName || studentEmail || studentPublicId || ""}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            {meta && meta.totalPages > 1 && (
              <PaginationControls meta={meta} onPageChange={setPage} />
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {studentEmail && (
          <p className="text-xs text-[var(--ink-secondary)]">Email: {studentEmail}</p>
        )}

        {isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            <p>Không thể tải lịch sử điểm danh.</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => void refetch()}>
              Thử lại
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={historyItems}
            getRowKey={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="Chưa có ghi nhận điểm danh nào cho thí sinh này."
            clientSideFiltering={false}
            clientSideSorting={false}
            clientSidePagination={false}
            showSearch={false}
          />
        )}
      </div>
    </Modal>
  );
}
