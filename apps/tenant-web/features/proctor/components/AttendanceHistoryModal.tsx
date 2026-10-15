"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Badge, Button, DataTable, ErrorState, Modal, PaginationControls, StatusBadge, type DataTableColumn } from "@pte/ui";
import type { AttendanceHistoryItemResponse } from "@pte/api-client";
import {
  getAttendanceBadgeVariant,
  getAttendanceStatusLabel,
  PROCTOR_HISTORY_MODAL_TEXT as T,
} from "../constants";
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

  const [prevStudentPublicId, setPrevStudentPublicId] = useState(studentPublicId);
  if (studentPublicId !== prevStudentPublicId) {
    setPrevStudentPublicId(studentPublicId);
    setPage(0);
  }

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
        header: T.COL_TIME,
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">
            {new Date(row.serverActionAt).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "actor",
        header: T.COL_ACTOR,
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
        header: T.COL_CHANGE,
        cell: (row) => (
          <div className="flex items-center gap-1.5">
            <StatusBadge
              label={getAttendanceStatusLabel(row.previousStatus)}
              variant={getAttendanceBadgeVariant(row.previousStatus)}
            />
            <span className="text-[var(--ink-muted)]">→</span>
            <StatusBadge
              label={getAttendanceStatusLabel(row.newStatus)}
              variant={getAttendanceBadgeVariant(row.newStatus)}
            />
          </div>
        ),
      },
      {
        key: "reason",
        header: T.COL_REASON,
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
      title={`${T.TITLE_PREFIX}${studentName || studentEmail || studentPublicId || ""}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            {meta && meta.totalPages > 1 && (
              <PaginationControls meta={meta} onPageChange={setPage} />
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {T.CLOSE_BTN}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {studentEmail && (
          <p className="text-xs text-[var(--ink-secondary)]">{T.EMAIL_PREFIX}{studentEmail}</p>
        )}

        {isError ? (
          <ErrorState
            title={T.ERROR_TITLE}
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                {T.RETRY_BTN}
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={historyItems}
            getRowKey={(row) => row.id}
            isLoading={isLoading}
            emptyTitle={T.EMPTY_TITLE}
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
