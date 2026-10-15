"use client";

import { useMemo, type ReactElement } from "react";
import { ActionMenu, Badge, Button, DataTable, StatusBadge, type DataTableColumn } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import {
  getAttendanceBadgeVariant,
  getAttendanceStatusLabel as getAttendanceLabel,
  getIdentityBadgeProps,
  PROCTOR_ROSTER_TEXT as T,
} from "../constants";

interface AttendanceRosterTableProps {
  rows: AttendanceRowResponse[];
  isLoading: boolean;
  canEditSession: boolean;
  onRecordAttendance: (row: AttendanceRowResponse, targetStatus: AttendanceStatus) => void;
  onViewHistory: (row: AttendanceRowResponse) => void;
  onVerifyIdentity?: (row: AttendanceRowResponse) => void;
}

export function AttendanceRosterTable({
  rows,
  isLoading,
  canEditSession,
  onRecordAttendance,
  onViewHistory,
  onVerifyIdentity,
}: AttendanceRosterTableProps): ReactElement {
  const columns: DataTableColumn<AttendanceRowResponse>[] = useMemo(
    () => [
      {
        key: "student",
        header: T.COL_STUDENT,
        cell: (row) => (
          <div>
            <div className="font-medium text-[var(--ink-primary)]">
              {row.displayName || row.studentPublicId}
            </div>
            {row.email && (
              <div className="text-xs text-[var(--ink-muted)]">{row.email}</div>
            )}
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
                  {row.blockingReason}
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
                <div className="mt-0.5 max-w-[160px] truncate text-[11px] text-[var(--ink-muted)]" title={row.identityNote}>
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
              <Badge variant="info">{row.latestAttemptActivityStatus}</Badge>
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
                  {T.BY_PREFIX}{row.lastActorRole}
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

  const renderRowActions = (row: AttendanceRowResponse) => {
    const canEditRow = canEditSession && row.canEdit;

    const actionItems = [];
    if (canEditRow && row.status !== "PRESENT") {
      actionItems.push({
        label: T.ACTION_PRESENT,
        onClick: () => onRecordAttendance(row, "PRESENT"),
      });
    }
    if (canEditRow && row.status !== "LATE") {
      actionItems.push({
        label: T.ACTION_LATE,
        onClick: () => onRecordAttendance(row, "LATE"),
      });
    }
    if (canEditRow && row.status !== "ABSENT") {
      actionItems.push({
        label: T.ACTION_ABSENT,
        onClick: () => onRecordAttendance(row, "ABSENT"),
      });
    }
    if (canEditRow && row.status !== "UNMARKED") {
      actionItems.push({
        label: T.ACTION_RESET,
        onClick: () => onRecordAttendance(row, "UNMARKED"),
      });
    }
    if (onVerifyIdentity) {
      actionItems.push({
        label: T.ACTION_VERIFY_IDENTITY,
        onClick: () => onVerifyIdentity(row),
      });
    }
    actionItems.push({
      label: T.ACTION_VIEW_HISTORY,
      onClick: () => onViewHistory(row),
    });

    return (
      <div className="flex items-center justify-end gap-1.5">
        {canEditRow && row.status !== "PRESENT" && (
          <Button
            variant="secondary"
            size="sm"
            className="text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            onClick={() => onRecordAttendance(row, "PRESENT")}
          >
            {T.ACTION_PRESENT}
          </Button>
        )}
        {canEditRow && row.status !== "LATE" && (
          <Button
            variant="secondary"
            size="sm"
            className="text-xs text-amber-700 hover:bg-amber-50 hover:text-amber-800"
            onClick={() => onRecordAttendance(row, "LATE")}
          >
            {T.ACTION_LATE}
          </Button>
        )}
        <ActionMenu items={actionItems} label={T.ACTION_MENU_LABEL} />
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.studentPublicId}
      isLoading={isLoading}
      emptyTitle={T.EMPTY_TITLE}
      rowActions={renderRowActions}
      clientSideFiltering={false}
      clientSideSorting={false}
      clientSidePagination={false}
      showSearch={false}
    />
  );
}
