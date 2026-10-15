"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, BackButton, Button, PageHeader, PaginationControls } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import { PROCTOR_ATTENDANCE_VIEW_TEXT as T } from "../constants";
import { useAttendanceRoster, useRecordIdentityVerificationMutation } from "../api";
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

  const identityMutation = useRecordIdentityVerificationMutation(sessionPublicId);

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
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`${T.TITLE_PREFIX}${sessionPublicId}`}
        subtitle={T.SUBTITLE}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <BackButton href="/proctor/attendance" label={T.BACK_BTN} />
            {data?.asOf && (
              <span className="text-xs text-[var(--ink-muted)]">
                {T.UPDATED_PREFIX}{new Date(data.asOf).toLocaleTimeString("vi-VN")}
              </span>
            )}
          </div>
        }
      />

      {!canEditSession && data?.sessionBlockingReason && (
        <Alert tone="warning" title={T.PORTAL_LOCKED_TITLE}>
          {data.sessionBlockingReason.includes("TIMING_PRE_OPEN") || data.sessionBlockingReason.includes("before 30 minutes")
            ? T.REASON_PRE_OPEN
            : data.sessionBlockingReason.includes("TIMING_CLOSED") || data.sessionBlockingReason.includes("closed after")
            ? T.REASON_CLOSED
            : data.sessionBlockingReason.includes("CANCELLED")
            ? T.REASON_CANCELLED
            : data.sessionBlockingReason}
          {data.attendanceWindowOpensAt && (
            <div className="mt-1 text-xs">
              {T.WINDOW_OPENS_AT_PREFIX}
              {new Date(data.attendanceWindowOpensAt).toLocaleString("vi-VN")}
            </div>
          )}
        </Alert>
      )}

      {isError && (
        <Alert tone="error" title={T.ERROR_TITLE}>
          <div className="flex items-center gap-3">
            <span>{T.ERROR_DESC}</span>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              {T.RETRY_BTN}
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
        onConfirmVerification={async ({ studentPublicId, status, note }) => {
          const target = rows.find((r) => r.studentPublicId === studentPublicId);
          await identityMutation.mutateAsync({
            studentPublicId,
            request: {
              status,
              enrollmentPublicId: target?.enrollmentPublicId ?? "",
              expectedVersion: target?.version ?? 0,
              requestPublicId: crypto.randomUUID(),
              note: note || undefined,
            },
          });
          refetch();
        }}
      />
    </div>
  );
}
