"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Alert, Button, PaginationControls } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import { useHostAttendanceRoster } from "@/features/proctor/api";
import { AttendanceSummaryCards } from "@/features/proctor/components/AttendanceSummaryCards";
import { AttendanceFilterToolbar } from "@/features/proctor/components/AttendanceFilterToolbar";
import { AttendanceRosterTable } from "@/features/proctor/components/AttendanceRosterTable";
import { RecordAttendanceModal } from "@/features/proctor/components/RecordAttendanceModal";
import { AttendanceHistoryModal } from "@/features/proctor/components/AttendanceHistoryModal";
import { IdentityVerificationModal } from "@/features/proctor/components/IdentityVerificationModal";

interface ExamAttendanceTabProps {
  sessionPublicId: string;
  sessionStatus?: string;
}

export function ExamAttendanceTab({
  sessionPublicId,
  sessionStatus,
}: ExamAttendanceTabProps): ReactElement {
  const [currentStatus, setCurrentStatus] = useState<AttendanceStatus | "ALL">("ALL");
  const [currentSearch, setCurrentSearch] = useState("");
  const [page, setPage] = useState(0);

  const [activeAction, setActiveAction] = useState<{
    row: AttendanceRowResponse;
    targetStatus: AttendanceStatus;
  } | null>(null);
  const [activeHistory, setActiveHistory] = useState<AttendanceRowResponse | null>(null);
  const [activeVerification, setActiveVerification] = useState<AttendanceRowResponse | null>(null);

  const { data, isLoading, isError, refetch } = useHostAttendanceRoster(sessionPublicId, {
    status: currentStatus,
    search: currentSearch || undefined,
    page,
    size: 20,
  });

  useEffect(() => {
    if (data && data.meta.totalPages > 0 && page >= data.meta.totalPages) {
      setPage(data.meta.totalPages - 1);
    }
  }, [data, page]);

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const canEditSession = data?.canEditSession ?? true;
  const isSessionClosed = sessionStatus === "CLOSED";

  return (
    <div className="space-y-5 motion-safe:animate-pte-fade-up">
      {isSessionClosed && (
        <Alert tone="info" title="Lưu ý quyền Host điều chỉnh ca thi đã đóng">
          Ca thi này đã đóng. Quyền Host cho phép bạn cập nhật hoặc đính chính điểm danh vì mục
          đích hành chính. Thao tác này không mở lại ca thi hay thay đổi kết quả bài thi. Lý do điều
          chỉnh là bắt buộc cho mọi thay đổi.
        </Alert>
      )}

      {isError && (
        <Alert tone="error" title="Không thể tải danh sách điểm danh">
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
        onFilterChange={(status) => {
          setCurrentStatus(status);
          setPage(0);
        }}
        onSearchChange={(search) => {
          setCurrentSearch(search);
          setPage(0);
        }}
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
        <PaginationControls meta={meta} onPageChange={(nextPage) => setPage(nextPage)} />
      )}

      <RecordAttendanceModal
        open={Boolean(activeAction)}
        onClose={() => setActiveAction(null)}
        row={activeAction?.row ?? null}
        targetStatus={activeAction?.targetStatus ?? null}
        sessionPublicId={sessionPublicId}
        isHost={true}
        onSuccess={() => void refetch()}
      />

      <AttendanceHistoryModal
        open={Boolean(activeHistory)}
        onClose={() => setActiveHistory(null)}
        sessionPublicId={sessionPublicId}
        studentPublicId={activeHistory?.studentPublicId ?? null}
        studentName={activeHistory?.displayName}
        studentEmail={activeHistory?.email}
        isHost={true}
      />

      <IdentityVerificationModal
        open={Boolean(activeVerification)}
        onClose={() => setActiveVerification(null)}
        row={activeVerification}
        sessionPublicId={sessionPublicId}
        onConfirmVerification={({ studentPublicId, status, note }) => {
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
