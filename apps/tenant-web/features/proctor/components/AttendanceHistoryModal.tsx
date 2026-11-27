"use client";

import { useState, type ReactElement } from "react";
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  PaginationControls,
} from "@pte/ui";
import { useAttendanceText } from "../hooks/useAttendanceText";
import { AttendanceHistoryEntry } from "./AttendanceHistoryEntry";
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
  const text = useAttendanceText();
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title={text.historyTitle}
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            {meta && meta.totalPages > 1 && (
              <PaginationControls meta={meta} onPageChange={setPage} disabled={isLoading} />
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {text.close}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-[var(--sky-tint)] p-4">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words text-base font-semibold text-[var(--ink-primary)]">
              {studentName || studentEmail || text.historyTitle}
            </h3>
            {studentEmail && (
              <p className="break-all text-sm text-[var(--ink-secondary)]">{studentEmail}</p>
            )}
            <p className="text-xs text-[var(--ink-secondary)]">{text.historySubtitle}</p>
          </div>
          {meta && (
            <Chip tone="sky">
              {meta.totalElements} {text.historyRecords}
            </Chip>
          )}
        </div>
        {isError ? (
          <ErrorState
            title={text.historyErrorTitle}
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                {text.retry}
              </Button>
            }
          />
        ) : isLoading ? (
          <LoadingState variant="rows" />
        ) : historyItems.length === 0 ? (
          <EmptyState title={text.historyEmpty} />
        ) : (
          <ol className="space-y-3">
            {historyItems.map((entry) => (
              <AttendanceHistoryEntry key={entry.id} entry={entry} />
            ))}
          </ol>
        )}
      </div>
    </Modal>
  );
}
