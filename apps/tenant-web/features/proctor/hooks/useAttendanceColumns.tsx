"use client";
import { getAttendanceActivityLabel } from "../attendancePresentation";
import { useMemo } from "react";
import { Badge, StatusBadge, type DataTableColumn } from "@pte/ui";
import type { AttendanceRowResponse } from "@pte/api-client";
import {
  getAttendanceBadgeVariant,
  getAttendanceStatusLabel as getAttendanceLabel,
  PROCTOR_ROSTER_TEXT as T,
} from "../constants";
export const useAttendanceColumns = (): DataTableColumn<AttendanceRowResponse>[] => {
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
        cell: (row) => (
          <StatusBadge
            label={getAttendanceLabel(row.status)}
            variant={getAttendanceBadgeVariant(row.status)}
          />
        ),
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
    [],
  );
};
