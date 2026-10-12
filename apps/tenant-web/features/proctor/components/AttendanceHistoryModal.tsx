"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Badge, Modal, Skeleton, StatusBadge, Button, PaginationControls } from "@pte/ui";
import type { AttendanceStatus } from "@pte/api-client";
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

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            <p>Không thể tải lịch sử điểm danh.</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => void refetch()}>
              Thử lại
            </Button>
          </div>
        )}

        {!isLoading && !isError && historyItems.length === 0 && (
          <div className="py-8 text-center text-sm text-[var(--ink-muted)]">
            Chưa có ghi nhận điểm danh nào cho thí sinh này.
          </div>
        )}

        {!isLoading && !isError && historyItems.length > 0 && (
          <div className="max-h-[50vh] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border-subtle)] text-xs text-[var(--ink-secondary)]">
                <tr>
                  <th className="pb-2 font-medium">Thời gian</th>
                  <th className="pb-2 font-medium">Người thực hiện</th>
                  <th className="pb-2 font-medium">Thay đổi</th>
                  <th className="pb-2 font-medium">Lý do / Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {historyItems.map((item) => (
                  <tr key={item.id} className="text-xs">
                    <td className="py-2.5 text-[var(--ink-secondary)]">
                      {new Date(item.serverActionAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-2.5">
                      <div className="font-medium text-[var(--ink-primary)]">
                        {item.actorDisplayName || item.actorPublicId}
                      </div>
                      <Badge variant="neutral" className="mt-0.5 text-[10px]">
                        {item.actorRole}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge
                          label={getStatusLabel(item.previousStatus)}
                          variant={getStatusBadgeVariant(item.previousStatus)}
                        />
                        <span className="text-[var(--ink-muted)]">→</span>
                        <StatusBadge
                          label={getStatusLabel(item.newStatus)}
                          variant={getStatusBadgeVariant(item.newStatus)}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 text-[var(--ink-secondary)]">
                      {item.reasonOrNote || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
