"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, BackButton, Button, PageHeader, PaginationControls } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import { useAttendanceRoster } from "../api";
import { AttendanceSummaryCards } from "./AttendanceSummaryCards";
import { AttendanceFilterToolbar } from "./AttendanceFilterToolbar";
import { AttendanceRosterTable } from "./AttendanceRosterTable";
import { RecordAttendanceModal } from "./RecordAttendanceModal";
import { AttendanceHistoryModal } from "./AttendanceHistoryModal";
import { IdentityVerificationModal } from "./IdentityVerificationModal";

interface ProctorAttendanceViewProps {
  sessionPublicId: string;
}

export function ProctorAttendanceView({
  sessionPublicId,
}: ProctorAttendanceViewProps): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatusParam = searchParams.get("status") ?? "ALL";
  const currentStatus = (
    ["ALL", "UNMARKED", "PRESENT", "ABSENT", "LATE"].includes(currentStatusParam)
      ? currentStatusParam
      : "ALL"
  ) as AttendanceStatus | "ALL";
  const currentSearch = searchParams.get("search") ?? "";
  const rawPage = parseInt(searchParams.get("page") ?? "0", 10);
  const currentPage = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;

  const [activeAction, setActiveAction] = useState<{
    row: AttendanceRowResponse;
    targetStatus: AttendanceStatus;
  } | null>(null);
  const [activeHistory, setActiveHistory] = useState<AttendanceRowResponse | null>(null);
  const [activeVerification, setActiveVerification] = useState<AttendanceRowResponse | null>(null);

  const { data, isLoading, isError, refetch } = useAttendanceRoster(sessionPublicId, {
    status: currentStatus,
    search: currentSearch || undefined,
    page: currentPage,
    size: 20,
  });

  const updateQueryParams = useCallback(
    (updates: { status?: string; search?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.status !== undefined) {
        if (updates.status === "ALL") params.delete("status");
        else params.set("status", updates.status);
      }
      if (updates.search !== undefined) {
        if (!updates.search) params.delete("search");
        else params.set("search", updates.search);
      }
      if (updates.page !== undefined) {
        if (updates.page === 0) params.delete("page");
        else params.set("page", String(updates.page));
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (data && data.meta.totalPages > 0 && currentPage >= data.meta.totalPages) {
      updateQueryParams({ page: data.meta.totalPages - 1 });
    }
  }, [data, currentPage, updateQueryParams]);

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const canEditSession = data?.canEditSession ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/proctor/attendance" label="Danh sách ca thi" />
        {data?.asOf && (
          <span className="text-xs text-[var(--ink-muted)]">
            Cập nhật lúc: {new Date(data.asOf).toLocaleTimeString("vi-VN")}
          </span>
        )}
      </div>

      <PageHeader
        title={`Điểm danh ca thi: ${sessionPublicId}`}
        subtitle="Quản lý và cập nhật danh sách có mặt / vắng mặt của thí sinh trong ca thi."
      />

      {!canEditSession && data?.sessionBlockingReason && (
        <Alert tone="warning" title="Cổng điểm danh bị khóa">
          {data.sessionBlockingReason.includes("TIMING_PRE_OPEN") || data.sessionBlockingReason.includes("before 30 minutes")
            ? "Điểm danh chỉ mở trước giờ thi 30 phút."
            : data.sessionBlockingReason.includes("TIMING_CLOSED") || data.sessionBlockingReason.includes("closed after")
            ? "Ca thi đã kết thúc thời gian điểm danh."
            : data.sessionBlockingReason.includes("CANCELLED")
            ? "Ca thi đã bị hủy bỏ."
            : data.sessionBlockingReason}
          {data.attendanceWindowOpensAt && (
            <div className="mt-1 text-xs">
              Thời gian mở điểm danh:{" "}
              {new Date(data.attendanceWindowOpensAt).toLocaleString("vi-VN")}
            </div>
          )}
        </Alert>
      )}

      {isError && (
        <Alert tone="error" title="Không thể tải danh sách thí sinh">
          <div className="flex items-center gap-3">
            <span>Đã có lỗi xảy ra khi truy vấn dữ liệu từ máy chủ.</span>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              Thử lại
            </Button>
          </div>
        </Alert>
      )}

      <AttendanceSummaryCards summary={data?.summary} isLoading={isLoading} />

      <AttendanceFilterToolbar
        currentStatus={currentStatus}
        summary={data?.summary}
        currentSearch={currentSearch}
        onFilterChange={(status) => updateQueryParams({ status, page: 0 })}
        onSearchChange={(search) => updateQueryParams({ search, page: 0 })}
        onRefresh={() => void refetch()}
      />

      <AttendanceRosterTable
        rows={rows}
        isLoading={isLoading}
        canEditSession={canEditSession}
        onRecordAttendance={(row, targetStatus) => setActiveAction({ row, targetStatus })}
        onViewHistory={(row) => setActiveHistory(row)}
        onVerifyIdentity={(row) => setActiveVerification(row)}
      />

      {meta && meta.totalPages > 1 && (
        <PaginationControls
          meta={meta}
          onPageChange={(nextPage) => updateQueryParams({ page: nextPage })}
        />
      )}

      <RecordAttendanceModal
        open={Boolean(activeAction)}
        onClose={() => setActiveAction(null)}
        row={activeAction?.row ?? null}
        targetStatus={activeAction?.targetStatus ?? null}
        sessionPublicId={sessionPublicId}
        onSuccess={() => void refetch()}
      />

      <AttendanceHistoryModal
        open={Boolean(activeHistory)}
        onClose={() => setActiveHistory(null)}
        sessionPublicId={sessionPublicId}
        studentPublicId={activeHistory?.studentPublicId ?? null}
        studentName={activeHistory?.displayName}
        studentEmail={activeHistory?.email}
      />

      <IdentityVerificationModal
        open={Boolean(activeVerification)}
        onClose={() => setActiveVerification(null)}
        row={activeVerification}
        sessionPublicId={sessionPublicId}
        onConfirmVerification={({ studentPublicId, status, note }) => {
          // Update row optimistically or refetch
          const target = rows.find((r) => r.studentPublicId === studentPublicId);
          if (target) {
            target.identityStatus = status;
            target.identityNote = note;
          }
        }}
      />
    </div>
  );
}
