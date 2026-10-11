"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Button, PageHeader } from "@pte/ui";
import { useCloseProctorSession, useMonitoringSnapshot } from "../api";
import { useProctorRoom } from "../useProctorRoom";
import { MonitoringConnectionBanner } from "./MonitoringConnectionBanner";
import { MonitoringStudentTable } from "./MonitoringStudentTable";
import { MonitoringStudentPanel } from "./MonitoringStudentPanel";
import { ForceSubmitDialog } from "./ForceSubmitDialog";
import { ViolationForm } from "./ViolationForm";
import { getStudentAttemptHistory, type MonitoringStudentResponse } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";

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
  const [unconfirmedNotice, setUnconfirmedNotice] = useState<{
    studentName: string;
    attemptPublicId: string;
    studentPublicId?: string;
  } | null>(null);
  const [isCheckingNotice, setIsCheckingNotice] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);

  const snapshotQuery = useMonitoringSnapshot(sessionPublicId, page, size, { poll: true });
  const room = useProctorRoom(sessionPublicId);
  const closeSessionMutation = useCloseProctorSession();

  const snapshot = snapshotQuery.data;
  const session = snapshot?.session;
  const summary = snapshot?.summary;
  const students = snapshot?.students.data ?? [];
  const totalItems = snapshot?.students.meta?.totalElements ?? snapshot?.session.totalEnrolled ?? students.length;
  const totalPages = snapshot?.students.meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / size));

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

  const handleCloseSessionClick = async (): Promise<void> => {
    if (!room.proctorSession?.publicId) return;
    if (!window.confirm("Bạn có chắc chắn muốn kết thúc phiên giám sát của mình? Ca thi vẫn tiếp tục với các giám thị khác.")) {
      return;
    }
    setIsClosingSession(true);
    try {
      await closeSessionMutation.mutateAsync(room.proctorSession.publicId);
      room.disconnect();
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

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <PageHeader
            title={session?.name ?? "Giám sát phòng thi"}
            subtitle={`Mã phòng: #${sessionPublicId.slice(0, 8).toUpperCase()}`}
          />
          {session && (
            <p className="mt-1 text-xs text-slate-500">
              Mở: {formatDateTime(session.opensAt)} — Đóng: {formatDateTime(session.closesAt)}
              {session.timeLimitMinutes && ` (${session.timeLimitMinutes} phút)`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/proctor/audit-log/${sessionPublicId}`}>
            <Button variant="secondary" size="sm">
              Nhật ký phòng thi
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => void snapshotQuery.refetch()}
            disabled={snapshotQuery.isFetching}
          >
            {snapshotQuery.isFetching ? "Đang cập nhật..." : "Làm mới"}
          </Button>

          {room.proctorSession?.status === "ACTIVE" && (
            <Button
              variant="danger"
              size="sm"
              disabled={isClosingSession}
              onClick={handleCloseSessionClick}
            >
              {isClosingSession ? "Đang đóng..." : "Rời phòng giám sát"}
            </Button>
          )}
        </div>
      </div>

      {/* Real-time connection status banner */}
      <MonitoringConnectionBanner
        status={room.connectionStatus}
        onReconnect={room.reconnect}
      />

      {/* Session Open Status / Error banner */}
      {room.isOpenPending && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
          Đang kết nối và khởi tạo phiên giám sát với hệ thống...
        </div>
      )}
      {room.openError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <span>{room.openError}</span>
          <Button variant="secondary" size="sm" onClick={() => void room.openSession()}>
            Thử lại mở phiên
          </Button>
        </div>
      )}

      {/* Unconfirmed Force Submit Alert */}
      {unconfirmedNotice && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div>
            <span className="font-semibold">Chưa xác nhận nộp bài:</span> Lệnh ép nộp cho thí sinh {unconfirmedNotice.studentName} đã được gửi nhưng máy thí sinh chưa xác nhận hoàn tất nộp bài. Vui lòng bấm kiểm tra lại.
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={isCheckingNotice}
            onClick={() => void handleRecheckUnconfirmed()}
          >
            {isCheckingNotice ? "Đang kiểm tra..." : "Làm mới kiểm tra"}
          </Button>
        </div>
      )}

      {/* Roster statistics summary cards */}
      {summary && (
        <section
          aria-label="Thống kê phòng thi"
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Đã đăng ký</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{summary.registeredCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Chưa bắt đầu</span>
            <div className="mt-1 text-2xl font-bold text-slate-600">{summary.notStartedCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-blue-600">Đang làm bài</span>
            <div className="mt-1 text-2xl font-bold text-blue-700">{summary.inProgressCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-green-600">Đã nộp bài</span>
            <div className="mt-1 text-2xl font-bold text-green-700">{summary.submittedCount}</div>
          </div>
        </section>
      )}

      {/* Roster student table */}
      <section aria-label="Danh sách thí sinh">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Danh sách thí sinh ({totalItems})
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              aria-label="Số thí sinh mỗi trang"
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={25}>25 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
            {snapshotQuery.isFetching && (
              <span className="text-xs text-slate-400">Đang cập nhật...</span>
            )}
          </div>
        </div>

        <MonitoringStudentTable
          students={students}
          selectedStudentPublicId={selectedStudent?.studentPublicId}
          onSelectStudent={(student) => setSelectedStudent(student)}
        />

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-600">
            <div>
              Hiển thị thí sinh {page * size + 1} – {Math.min((page + 1) * size, totalItems)} trên tổng số {totalItems}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 0 || snapshotQuery.isFetching}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Trang trước
              </Button>
              <span className="px-2 font-medium">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1 || snapshotQuery.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
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
    </div>
  );
}
