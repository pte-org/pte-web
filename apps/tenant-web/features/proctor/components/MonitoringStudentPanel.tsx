"use client";

import type { ReactElement } from "react";
import { Button, EmptyState, LoadingState } from "@pte/ui";
import { useStudentAttemptHistory } from "../api";
import type { MonitoringStudentResponse } from "@pte/api-client";
import { PROCTOR_LIVE_TEXT } from "../constants";

interface MonitoringStudentPanelProps {
  sessionPublicId: string;
  student: MonitoringStudentResponse | null;
  isConnected?: boolean;
  onClose: () => void;
  onOpenForceSubmit: (student: MonitoringStudentResponse) => void;
  onOpenViolation: (student: MonitoringStudentResponse) => void;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

export function MonitoringStudentPanel({
  sessionPublicId,
  student,
  isConnected = true,
  onClose,
  onOpenForceSubmit,
  onOpenViolation,
}: MonitoringStudentPanelProps): ReactElement | null {
  const historyQuery = useStudentAttemptHistory(
    sessionPublicId,
    student?.studentPublicId ?? "",
  );

  if (!student) return null;

  const historyAttempts = historyQuery.data?.data ?? [];
  const canForceSubmit = student.status === "IN_PROGRESS" && Boolean(student.attemptPublicId);

  return (
    <aside
      aria-label={PROCTOR_LIVE_TEXT.PANEL_TITLE}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{student.displayName}</h3>
          <p className="text-xs text-slate-500">{student.email ?? PROCTOR_LIVE_TEXT.PANEL_NO_EMAIL}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={PROCTOR_LIVE_TEXT.PANEL_CLOSE_ARIA}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Current attempt status */}
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {PROCTOR_LIVE_TEXT.PANEL_CURRENT_ATTEMPT}
          </h4>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-slate-500">{PROCTOR_LIVE_TEXT.PANEL_ATTEMPT_ID}</dt>
              <dd className="font-mono text-slate-900">
                {student.attemptPublicId ? student.attemptPublicId.slice(0, 8).toUpperCase() : PROCTOR_LIVE_TEXT.PANEL_NOT_AVAILABLE}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{PROCTOR_LIVE_TEXT.PANEL_ATTEMPT_COUNT}</dt>
              <dd className="font-semibold text-slate-900">
                {student.attemptNumber ? `#${student.attemptNumber}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{PROCTOR_LIVE_TEXT.PANEL_STATUS}</dt>
              <dd className="font-semibold text-slate-900">
                {student.status === "IN_PROGRESS"
                  ? PROCTOR_LIVE_TEXT.STATUS_IN_PROGRESS
                  : student.status === "SUBMITTED"
                    ? PROCTOR_LIVE_TEXT.STATUS_SUBMITTED
                    : student.status === "ABANDONED"
                      ? PROCTOR_LIVE_TEXT.STATUS_ABANDONED
                      : PROCTOR_LIVE_TEXT.STATUS_NOT_STARTED}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{PROCTOR_LIVE_TEXT.PANEL_VIOLATIONS_RECORDED}</dt>
              <dd className="font-semibold text-amber-600">
                {student.manualViolationCount}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{PROCTOR_LIVE_TEXT.PANEL_STARTED_AT}</dt>
              <dd className="text-slate-700">{formatDateTime(student.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{PROCTOR_LIVE_TEXT.PANEL_LAST_SEEN}</dt>
              <dd className="text-slate-700">{formatDateTime(student.lastSeenAt)}</dd>
            </div>
          </dl>
        </section>

        {/* Action buttons */}
        <section className="flex flex-col gap-2">
          <Button
            variant="secondary"
            className="w-full justify-center"
            disabled={!isConnected}
            title={!isConnected ? PROCTOR_LIVE_TEXT.PANEL_DISCONNECTED_TOOLTIP : undefined}
            onClick={() => onOpenViolation(student)}
          >
            {PROCTOR_LIVE_TEXT.PANEL_FLAG_VIOLATION_BTN}
          </Button>

          {canForceSubmit && (
            <Button
              variant="danger"
              className="w-full justify-center"
              disabled={!isConnected}
              title={!isConnected ? PROCTOR_LIVE_TEXT.PANEL_DISCONNECTED_TOOLTIP : undefined}
              onClick={() => onOpenForceSubmit(student)}
            >
              {PROCTOR_LIVE_TEXT.PANEL_FORCE_SUBMIT_BTN}
            </Button>
          )}
        </section>

        {/* Attempt history list */}
        <section className="border-t border-slate-200 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {PROCTOR_LIVE_TEXT.PANEL_ATTEMPT_HISTORY_TITLE} ({historyAttempts.length})
          </h4>

          {historyQuery.isLoading ? (
            <div className="mt-3">
              <LoadingState rows={2} variant="rows" label={PROCTOR_LIVE_TEXT.PANEL_LOADING_HISTORY} />
            </div>
          ) : historyAttempts.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                title={PROCTOR_LIVE_TEXT.PANEL_EMPTY_HISTORY_TITLE}
                description={PROCTOR_LIVE_TEXT.PANEL_EMPTY_HISTORY_DESC}
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {historyAttempts.map((att) => (
                <li key={att.attemptPublicId} className="p-3 text-xs bg-white hover:bg-slate-50">
                  <div className="flex justify-between font-medium text-slate-900">
                    <span>{PROCTOR_LIVE_TEXT.PANEL_ATTEMPT_NUMBER_PREFIX}{att.attemptNumber}</span>
                    <span
                      className={
                        att.status === "SUBMITTED"
                          ? "text-green-600 font-semibold"
                          : att.status === "IN_PROGRESS"
                            ? "text-blue-600 font-semibold"
                            : "text-slate-500"
                      }
                    >
                      {att.status}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-slate-500 text-[11px]">
                    <span>Bắt đầu: {formatDateTime(att.startedAt)}</span>
                    {att.submittedAt && <span>Nộp: {formatDateTime(att.submittedAt)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
