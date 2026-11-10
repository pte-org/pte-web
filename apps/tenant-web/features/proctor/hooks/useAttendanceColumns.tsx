"use client";
import {
  getAttendanceBlockingMessage,
  getAttendanceActivityLabel,
} from "../attendancePresentation";
import { useMemo } from "react";
import { Badge, StatusBadge, type DataTableColumn } from "@pte/ui";
import type { AttendanceRowResponse } from "@pte/api-client";
import {
  getAttendanceBadgeVariant,
  getAttendanceStatusLabel as getAttendanceLabel,
  getIdentityBadgeProps,
  PROCTOR_ROSTER_TEXT as T,
} from "../constants";
export const useAttendanceColumns = (
  canEditSession: boolean,
): DataTableColumn<AttendanceRowResponse>[] => {
  return useMemo(
    () => [
      {
        key: "student",
        header: T.COL_STUDENT,
        cell: (row) => (
          <div>
            <div className="font-medium text-[var(--ink-primary)]">
              {row.displayName || row.studentPublicId}
            </div>
            {row.email && <div className="text-xs text-[var(--ink-muted)]">{row.email}</div>}
          </div>
        ),
      },
      {
        key: "attendance",
        header: T.COL_ATTENDANCE,
        cell: (row) => {
          const canEditRow = canEditSession && row.canEdit;
          return (
            <div>
              <StatusBadge
                label={getAttendanceLabel(row.status)}
                variant={getAttendanceBadgeVariant(row.status)}
              />
              {!canEditRow && row.blockingReason && (
                <div className="mt-1 text-[11px] text-[var(--ink-muted)]">
                  {getAttendanceBlockingMessage(row.blockingReason)}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "identity",
        header: T.COL_IDENTITY,
        cell: (row) => {
          const { label, variant } = getIdentityBadgeProps(row.identityStatus);
          return (
            <div>
              <StatusBadge label={label} variant={variant} />
              {row.identityNote && (
                <div
                  className="mt-0.5 max-w-[160px] truncate text-[11px] text-[var(--ink-muted)]"
                  title={row.identityNote}
                >
                  {row.identityNote}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "activity",
        header: T.COL_ACTIVITY,
        cell: (row) =>
          row.latestAttemptActivityStatus ? (
            <div>
              <Badge variant="info">
                {getAttendanceActivityLabel(row.latestAttemptActivityStatus)}
              </Badge>
              {row.latestAttemptActivityAt && (
                <div className="mt-1 text-[11px] text-[var(--ink-muted)]">
                  {new Date(row.latestAttemptActivityAt).toLocaleTimeString("vi-VN")}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">{T.NOT_STARTED}</span>
          ),
      },
      {
        key: "lastAction",
        header: T.COL_LAST_ACTION,
        cell: (row) =>
          row.lastActionAt ? (
            <div className="text-xs text-[var(--ink-secondary)]">
              <div>{new Date(row.lastActionAt).toLocaleString("vi-VN")}</div>
              {row.lastActorRole && (
                <div className="text-[11px] text-[var(--ink-muted)]">
                  {T.BY_PREFIX}
                  {row.lastActorRole}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">—</span>
          ),
      },
    ],
    [canEditSession],
  );
};
