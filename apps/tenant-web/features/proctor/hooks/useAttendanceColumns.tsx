"use client";
import { useMemo } from "react";
import { Badge, StatusBadge, type DataTableColumn } from "@pte/ui";
import type { AttendanceRowResponse } from "@pte/api-client";
import {
  getAttendanceBadgeVariant,
} from "../constants";
import { useAttendanceText } from "./useAttendanceText";
export const useAttendanceColumns = (): DataTableColumn<AttendanceRowResponse>[] => {
  const text = useAttendanceText();
  return useMemo(
    () => [
      {
        key: "student",
        header: text.colStudent,
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
        header: text.colAttendance,
        cell: (row) => (
          <StatusBadge
            label={text.statusLabel(row.status)}
            variant={getAttendanceBadgeVariant(row.status)}
          />
        ),
      },
      {
        key: "activity",
        header: text.colActivity,
        cell: (row) =>
          row.latestAttemptActivityStatus ? (
            <div>
              <Badge variant="info">
                {text.activityLabel(row.latestAttemptActivityStatus)}
              </Badge>
              {row.latestAttemptActivityAt && (
                <div className="mt-1 text-[11px] text-[var(--ink-muted)]">
                  {text.formatTime(row.latestAttemptActivityAt)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">{text.notStarted}</span>
          ),
      },
      {
        key: "lastAction",
        header: text.colLastAction,
        cell: (row) =>
          row.lastActionAt ? (
            <div className="text-xs text-[var(--ink-secondary)]">
              <div>{text.formatDateTime(row.lastActionAt)}</div>
              {row.lastActorRole && (
                <div className="text-[11px] text-[var(--ink-muted)]">
                  {text.byPrefix}
                  {row.lastActorRole}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">—</span>
          ),
      },
    ],
    [text],
  );
};
