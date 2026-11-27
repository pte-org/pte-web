"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Alert, Button, PaginationControls } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import { useHostAttendanceRoster } from "@/features/proctor/api";
import { useDebouncedSearch } from "@/features/search/useDebouncedSearch";
import { PROCTOR_TOOLBAR_TEXT } from "@/features/proctor/constants";
import { AttendanceSummaryCards } from "@/features/proctor/components/AttendanceSummaryCards";
import { AttendanceFilterToolbar } from "@/features/proctor/components/AttendanceFilterToolbar";
import { AttendanceRosterTable } from "@/features/proctor/components/AttendanceRosterTable";
import { RecordAttendanceModal } from "@/features/proctor/components/RecordAttendanceModal";
import { AttendanceHistoryModal } from "@/features/proctor/components/AttendanceHistoryModal";

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
  const debouncedSearch = useDebouncedSearch(currentSearch);
  const [page, setPage] = useState(0);

  const [activeAction, setActiveAction] = useState<{
    row: AttendanceRowResponse;
    targetStatus: AttendanceStatus;
  } | null>(null);
  const [activeHistory, setActiveHistory] = useState<AttendanceRowResponse | null>(null);

  const { data, isLoading, isError, refetch } = useHostAttendanceRoster(sessionPublicId, {
    status: currentStatus,
    search: debouncedSearch || undefined,
    page,
    size: 20,
  });

  useEffect(() => {
    if (data && data.meta.totalPages > 0 && page >= data.meta.totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <Alert tone="warning" title="Kỳ thi đã kết thúc">
          Ca thi này đã đóng nên không thể điểm danh hay chỉnh sửa điểm danh nữa. Bạn chỉ có thể
          xem lại danh sách.
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

      <AttendanceRosterTable
        rows={rows}
        isLoading={isLoading}
        canEditSession={canEditSession}
        searchValue={currentSearch}
        onSearchChange={(search) => {
          setCurrentSearch(search);
          setPage(0);
        }}
        filters={
          <AttendanceFilterToolbar
            currentStatus={currentStatus}
            summary={data?.summary}
            onFilterChange={(status) => {
              setCurrentStatus(status);
              setPage(0);
            }}
          />
        }
        toolbarActions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            {PROCTOR_TOOLBAR_TEXT.REFRESH_BTN}
          </Button>
        }
        pagination={
          meta && meta.totalPages > 1 ? (
            <PaginationControls meta={meta} onPageChange={setPage} />
          ) : undefined
        }
        onRecordAttendance={(row, targetStatus) => setActiveAction({ row, targetStatus })}
        onViewHistory={(row) => setActiveHistory(row)}
      />

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
    </div>
  );
}
