"use client";

import { useFeedbackToast } from "../hooks/useFeedbackToast";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, ErrorState, PaginationControls } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import { useAttendanceText } from "../hooks/useAttendanceText";
import { useAttendanceRoster } from "../api";
import { useForceSubmitDialog } from "../hooks/useForceSubmitDialog";
import { useAttendanceSearch } from "../hooks/useAttendanceSearch";
import { AttendanceFilterToolbar } from "./AttendanceFilterToolbar";
import { AttendanceRosterTable } from "./AttendanceRosterTable";
import { RecordAttendanceModal } from "./RecordAttendanceModal";
import { AttendanceHistoryModal } from "./AttendanceHistoryModal";

interface ProctorAttendanceViewProps {
  sessionPublicId: string;
}

export function ProctorAttendanceView({
  sessionPublicId,
}: ProctorAttendanceViewProps): ReactElement {
  const text = useAttendanceText();
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
  const search = useAttendanceSearch(currentSearch);
  const rawPage = parseInt(searchParams.get("page") ?? "0", 10);
  const currentPage = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;

  const [activeAction, setActiveAction] = useState<{
    row: AttendanceRowResponse;
    targetStatus: AttendanceStatus;
  } | null>(null);
  const [activeHistory, setActiveHistory] = useState<AttendanceRowResponse | null>(null);

  const { data, isLoading, isError, refetch } = useAttendanceRoster(sessionPublicId, {
    status: currentStatus,
    search: currentSearch || undefined,
    page: currentPage,
    size: 20,
  });

  useFeedbackToast(isError && data ? text.viewErrorBody : null);

  const forceSubmit = useForceSubmitDialog(sessionPublicId);

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

  if (isError && !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ErrorState
          title={text.viewErrorTitle}
          description={text.viewErrorBody}
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              {text.retry}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <AttendanceRosterTable
        rows={rows}
        isLoading={isLoading}
        canEditSession={canEditSession}
        onRecordAttendance={(row, targetStatus) => setActiveAction({ row, targetStatus })}
        onViewHistory={(row) => setActiveHistory(row)}
        onForceSubmit={forceSubmit.request}
        searchValue={search.value}
        onSearchChange={search.onChange}
        filters={
          <AttendanceFilterToolbar
            currentStatus={currentStatus}
            summary={data?.summary}
            onFilterChange={(status) => updateQueryParams({ status, page: 0 })}
          />
        }
        pagination={
          meta && meta.totalPages > 1 ? (
            <PaginationControls
              meta={meta}
              onPageChange={(nextPage) => updateQueryParams({ page: nextPage })}
            />
          ) : undefined
        }
      />

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

      {forceSubmit.dialog}
    </div>
  );
}
