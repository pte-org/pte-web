"use client";

import type { ReactElement } from "react";
import type { AssignedProctorSessionResponse, AttendancePageResponse } from "@pte/api-client";
import { Alert, DashboardCard, PageHeader, StatusBadge } from "@pte/ui";
import { getAttendanceBlockingMessage } from "../attendancePresentation";
import { PROCTOR_ATTENDANCE_VIEW_TEXT as T } from "../constants";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";

interface ProctorSessionInfoCardProps {
  session: Pick<AssignedProctorSessionResponse, "name" | "status" | "opensAt" | "closesAt">;
  attendance?: Pick<
    AttendancePageResponse,
    "asOf" | "canEditSession" | "sessionBlockingReason" | "attendanceWindowOpensAt"
  >;
}

export const ProctorSessionInfoCard = ({
  session,
  attendance,
}: ProctorSessionInfoCardProps): ReactElement => {
  const text = useProctorWorkspaceText();
  const formatter = new Intl.DateTimeFormat(text.locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const label =
    session.status === "OPEN"
      ? text.statusOpen
      : session.status === "SCHEDULED"
        ? text.statusScheduled
        : session.status === "CANCELLED"
          ? text.statusCancelled
          : text.statusClosed;

  return (
    <DashboardCard>
      <div className="space-y-4">
        <PageHeader
          title={session.name}
          actions={
            attendance?.asOf ? (
              <span className="text-xs text-[var(--ink-muted)]">
                {T.UPDATED_PREFIX}
                {new Date(attendance.asOf).toLocaleTimeString(
                  text.locale === "vi" ? "vi-VN" : "en-US",
                )}
              </span>
            ) : undefined
          }
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[var(--ink-secondary)]">
          <StatusBadge
            label={label}
            variant={
              session.status === "OPEN"
                ? "success"
                : session.status === "SCHEDULED"
                  ? "info"
                  : session.status === "CANCELLED"
                    ? "danger"
                    : "neutral"
            }
          />
          <span>
            {text.tableColOpensAt}: {formatter.format(new Date(session.opensAt))}
          </span>
          <span>
            {text.tableColClosesAt}: {formatter.format(new Date(session.closesAt))}
          </span>
        </div>
        {!attendance?.canEditSession && attendance?.sessionBlockingReason && (
          <div className="border-t border-[var(--divider)] pt-4">
            <Alert tone="warning" title={T.PORTAL_LOCKED_TITLE}>
              {getAttendanceBlockingMessage(attendance.sessionBlockingReason)}
              {attendance.attendanceWindowOpensAt && (
                <p className="mt-1 text-xs">
                  {T.WINDOW_OPENS_AT_PREFIX}
                  {formatter.format(new Date(attendance.attendanceWindowOpensAt))}
                </p>
              )}
            </Alert>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};
