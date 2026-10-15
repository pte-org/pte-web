"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, ConfirmDialog, ErrorState, LoadingState, PageHeader, StatCard } from "@pte/ui";
import { useCloseProctorSession, useMonitoringSnapshot } from "../api";
import { useProctorRoom } from "../useProctorRoom";
import { MonitoringConnectionBanner } from "./MonitoringConnectionBanner";
import { MonitoringStudentTable } from "./MonitoringStudentTable";
import { MonitoringStudentPanel } from "./MonitoringStudentPanel";
import { ForceSubmitDialog } from "./ForceSubmitDialog";
import { ViolationForm } from "./ViolationForm";
import { getStudentAttemptHistory, type MonitoringStudentResponse } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import {
  DEFAULT_PROCTOR_PAGE_SIZE,
  PROCTOR_LIVE_TEXT,
  PROCTOR_MONITORING_PAGE_SIZES,
} from "../constants";

interface LiveMonitoringViewProps {
  sessionPublicId: string;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function LiveMonitoringView({ sessionPublicId }: LiveMonitoringViewProps): ReactElement {
  const [selectedStudent, setSelectedStudent] = useState<MonitoringStudentResponse | null>(null);
  const [forceSubmitTarget, setForceSubmitTarget] = useState<MonitoringStudentResponse | null>(null);
  const [violationTarget, setViolationTarget] = useState<MonitoringStudentResponse | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [isCloseSessionDialogOpen, setIsCloseSessionDialogOpen] = useState(false);
  const [unconfirmedNotice, setUnconfirmedNotice] = useState<{
    studentName: string;
    attemptPublicId: string;
    studentPublicId?: string;
  } | null>(null);
  const [isCheckingNotice, setIsCheckingNotice] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(DEFAULT_PROCTOR_PAGE_SIZE);

  const snapshotQuery = useMonitoringSnapshot(sessionPublicId, page, size, { poll: true });
  const room = useProctorRoom(sessionPublicId);
  const closeSessionMutation = useCloseProctorSession();

  const snapshot = snapshotQuery.data;
  const session = snapshot?.session;
  const summary = snapshot?.summary;
  const students = snapshot?.students.data ?? [];
  const meta = snapshot?.students.meta;
  const totalItems = meta?.totalElements ?? snapshot?.session.totalEnrolled ?? students.length;

  const handleForceSubmitConfirm = async (reason: string): Promise<void> => {
    if (!forceSubmitTarget?.attemptPublicId || room.connectionStatus !== "CONNECTED") return;
    setIsSubmittingAction(true);
    try {
      const outcome = await room.forceSubmit({
        attemptPublicId: forceSubmitTarget.attemptPublicId,
        studentPublicId: forceSubmitTarget.studentPublicId,
        reason,
      });
      if (outcome === "ACKNOWLEDGED_UNCONFIRMED") {
        setUnconfirmedNotice({
          studentName: forceSubmitTarget.displayName,
          attemptPublicId: forceSubmitTarget.attemptPublicId,
          studentPublicId: forceSubmitTarget.studentPublicId,
        });
      } else {
        setUnconfirmedNotice(null);
      }
      setForceSubmitTarget(null);
      if (selectedStudent?.studentPublicId === forceSubmitTarget.studentPublicId) {
        setSelectedStudent(null);
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleFlagViolationConfirm = async (payload: {
    violationType: string;
    detail: string;
  }): Promise<void> => {
    if (!violationTarget?.attemptPublicId || room.connectionStatus !== "CONNECTED") return;
    setIsSubmittingAction(true);
    try {
      await room.flagViolation({
        attemptPublicId: violationTarget.attemptPublicId,
        violationType: payload.violationType,
        detail: payload.detail,
      });
      setViolationTarget(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCloseSessionConfirm = async (): Promise<void> => {
    if (!room.proctorSession?.publicId) return;
    setIsClosingSession(true);
    try {
      await closeSessionMutation.mutateAsync(room.proctorSession.publicId);
      room.disconnect();
      setIsCloseSessionDialogOpen(false);
    } finally {
      setIsClosingSession(false);
    }
  };

  const handleRecheckUnconfirmed = async (): Promise<void> => {
    if (!unconfirmedNotice) return;
    setIsCheckingNotice(true);
    try {
      const result = await snapshotQuery.refetch();
      const studentList = result.data?.students.data ?? [];
      const match = studentList.find((s) => s.attemptPublicId === unconfirmedNotice.attemptPublicId);
      if (match && match.status === "SUBMITTED") {
        setUnconfirmedNotice(null);
        return;
      }
      if (unconfirmedNotice.studentPublicId) {
        const history = await getStudentAttemptHistory(
          apiClient,
          sessionPublicId,
          unconfirmedNotice.studentPublicId,
          0,
          5,
        );
        const attempt = history.data.find(
          (a) => a.attemptPublicId === unconfirmedNotice.attemptPublicId,
        );
        if (attempt && attempt.status === "SUBMITTED") {
          setUnconfirmedNotice(null);
        }
      }
    } finally {
      setIsCheckingNotice(false);
    }
  };

  if (snapshotQuery.isLoading && !snapshot) {
    return (
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title={PROCTOR_LIVE_TEXT.TITLE}
          subtitle={`${PROCTOR_LIVE_TEXT.ROOM_CODE_PREFIX}${sessionPublicId.slice(0, 8).toUpperCase()}`}
          actions={
            <Link href="/proctor/sessions">
              <Button variant="secondary" size="sm">
                {PROCTOR_LIVE_TEXT.BACK_TO_SESSIONS_BTN}
              </Button>
            </Link>
          }
        />
        <LoadingState variant="table" label={PROCTOR_LIVE_TEXT.LOADING} />
      </div>
    );
  }

  if (snapshotQuery.isError && !snapshot) {
    return (
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title={PROCTOR_LIVE_TEXT.TITLE}
          subtitle={`${PROCTOR_LIVE_TEXT.ROOM_CODE_PREFIX}${sessionPublicId.slice(0, 8).toUpperCase()}`}
          actions={
            <Link href="/proctor/sessions">
              <Button variant="secondary" size="sm">
                {PROCTOR_LIVE_TEXT.BACK_TO_SESSIONS_BTN}
              </Button>
            </Link>
          }
        />
        <ErrorState
          title={PROCTOR_LIVE_TEXT.ERROR_TITLE}
          description={PROCTOR_LIVE_TEXT.ERROR_DESCRIPTION}
          action={
            <Button variant="secondary" size="sm" onClick={() => void snapshotQuery.refetch()}>
              {PROCTOR_LIVE_TEXT.RETRY}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <PageHeader
        title={session?.name ?? PROCTOR_LIVE_TEXT.TITLE}
        subtitle={`${PROCTOR_LIVE_TEXT.ROOM_CODE_PREFIX}${sessionPublicId.slice(0, 8).toUpperCase()}${session ? ` • ${PROCTOR_LIVE_TEXT.OPEN_PREFIX}${formatDateTime(session.opensAt)}${PROCTOR_LIVE_TEXT.CLOSE_PREFIX}${formatDateTime(session.closesAt)}${session.timeLimitMinutes ? ` (${session.timeLimitMinutes}${PROCTOR_LIVE_TEXT.MINUTES_SUFFIX})` : ""}` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/proctor/sessions">
              <Button variant="secondary" size="sm">
                {PROCTOR_LIVE_TEXT.BACK_TO_SESSIONS_BTN}
              </Button>
            </Link>

            <Link href={`/proctor/audit-log/${sessionPublicId}`}>
              <Button variant="secondary" size="sm">
                {PROCTOR_LIVE_TEXT.AUDIT_LOG_BTN}
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => void snapshotQuery.refetch()}
              disabled={snapshotQuery.isFetching}
            >
              {snapshotQuery.isFetching ? PROCTOR_LIVE_TEXT.UPDATING_TEXT : PROCTOR_LIVE_TEXT.REFRESH_BTN}
            </Button>

            {room.proctorSession?.status === "ACTIVE" && (
              <Button
                variant="danger"
                size="sm"
                disabled={isClosingSession}
                onClick={() => setIsCloseSessionDialogOpen(true)}
              >
                {isClosingSession ? PROCTOR_LIVE_TEXT.LEAVING_ROOM_BTN : PROCTOR_LIVE_TEXT.LEAVE_ROOM_BTN}
              </Button>
            )}
          </div>
        }
      />

      {/* Real-time connection status banner */}
      <MonitoringConnectionBanner
        status={room.connectionStatus}
        onReconnect={room.reconnect}
      />

      {/* Session Open Status / Error banner */}
      {room.isOpenPending && (
        <Alert tone="info">
          {PROCTOR_LIVE_TEXT.SESSION_OPEN_PENDING}
        </Alert>
      )}
      {room.openError && (
        <Alert tone="error">
          <div className="flex items-center justify-between">
            <span>{room.openError}</span>
            <Button variant="secondary" size="sm" onClick={() => void room.openSession()}>
              {PROCTOR_LIVE_TEXT.SESSION_OPEN_RETRY}
            </Button>
          </div>
        </Alert>
      )}

      {/* Unconfirmed Force Submit Alert */}
      {unconfirmedNotice && (
        <Alert tone="warning" title={PROCTOR_LIVE_TEXT.UNCONFIRMED_FORCE_SUBMIT_TITLE}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {PROCTOR_LIVE_TEXT.UNCONFIRMED_FORCE_SUBMIT_MSG}
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={isCheckingNotice}
              onClick={() => void handleRecheckUnconfirmed()}
            >
              {isCheckingNotice ? PROCTOR_LIVE_TEXT.CHECKING_BTN : PROCTOR_LIVE_TEXT.RECHECK_BTN}
            </Button>
          </div>
        </Alert>
      )}

      {/* Roster statistics summary cards */}
      {summary && (
        <section aria-label={PROCTOR_LIVE_TEXT.SUMMARY_LABEL} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={PROCTOR_LIVE_TEXT.SUMMARY_REGISTERED}
            value={String(summary.registeredCount)}
            accent="blue"
          />
          <StatCard
            label={PROCTOR_LIVE_TEXT.SUMMARY_NOT_STARTED}
            value={String(summary.notStartedCount)}
            accent="cream"
          />
          <StatCard
            label={PROCTOR_LIVE_TEXT.SUMMARY_IN_PROGRESS}
            value={String(summary.inProgressCount)}
            accent="blue"
          />
          <StatCard
            label={PROCTOR_LIVE_TEXT.SUMMARY_SUBMITTED}
            value={String(summary.submittedCount)}
            accent="mint"
          />
        </section>
      )}

      {/* Roster student table */}
      <section aria-label={PROCTOR_LIVE_TEXT.STUDENTS_SECTION_LABEL} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--ink-primary)]">
            {PROCTOR_LIVE_TEXT.STUDENTS_TABLE_TITLE} ({totalItems})
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              aria-label={PROCTOR_LIVE_TEXT.PER_PAGE_ARIA}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] px-2 py-1 text-xs text-[var(--ink-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PROCTOR_MONITORING_PAGE_SIZES.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} {PROCTOR_LIVE_TEXT.PER_PAGE_SUFFIX}
                </option>
              ))}
            </select>
            {snapshotQuery.isFetching && (
              <span className="text-xs text-[var(--ink-muted)]">{PROCTOR_LIVE_TEXT.UPDATING_TEXT}</span>
            )}
          </div>
        </div>

        <MonitoringStudentTable
          students={students}
          selectedStudentPublicId={selectedStudent?.studentPublicId}
          onSelectStudent={(student) => setSelectedStudent(student)}
          isLoading={snapshotQuery.isLoading}
          meta={meta}
          onPageChange={(p) => setPage(p)}
        />
      </section>

      {/* Drawer Panel */}
      <MonitoringStudentPanel
        sessionPublicId={sessionPublicId}
        student={selectedStudent}
        isConnected={room.connectionStatus === "CONNECTED"}
        onClose={() => setSelectedStudent(null)}
        onOpenForceSubmit={(s) => setForceSubmitTarget(s)}
        onOpenViolation={(s) => setViolationTarget(s)}
      />

      {/* Force submit confirmation modal */}
      <ForceSubmitDialog
        isOpen={Boolean(forceSubmitTarget)}
        studentName={forceSubmitTarget?.displayName ?? ""}
        attemptPublicId={forceSubmitTarget?.attemptPublicId ?? ""}
        isLoading={isSubmittingAction}
        disabled={room.connectionStatus !== "CONNECTED"}
        onClose={() => setForceSubmitTarget(null)}
        onConfirm={handleForceSubmitConfirm}
      />

      {/* Violation form modal */}
      <ViolationForm
        isOpen={Boolean(violationTarget)}
        studentName={violationTarget?.displayName}
        attemptPublicId={violationTarget?.attemptPublicId}
        isLoading={isSubmittingAction}
        disabled={room.connectionStatus !== "CONNECTED"}
        onClose={() => setViolationTarget(null)}
        onConfirm={handleFlagViolationConfirm}
      />

      {/* Close session confirmation dialog */}
      <ConfirmDialog
        open={isCloseSessionDialogOpen}
        title={PROCTOR_LIVE_TEXT.CLOSE_SESSION_CONFIRM_TITLE}
        description={PROCTOR_LIVE_TEXT.CLOSE_SESSION_CONFIRM_DESC}
        confirmLabel={PROCTOR_LIVE_TEXT.CLOSE_SESSION_CONFIRM_ACTION}
        cancelLabel={PROCTOR_LIVE_TEXT.CANCEL}
        tone="danger"
        isConfirming={isClosingSession}
        onConfirm={handleCloseSessionConfirm}
        onClose={() => setIsCloseSessionDialogOpen(false)}
      />
    </div>
  );
}
