"use client";

import { type ReactElement, type ReactNode } from "react";
import { ActionMenu, DataTable, type DropdownItem } from "@pte/ui";
import { useAttendanceColumns } from "../hooks/useAttendanceColumns";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import {
  ATTEMPT_IN_PROGRESS,
  PROCTOR_FORCE_SUBMIT_TEXT,
  PROCTOR_ROSTER_TEXT as T,
  PROCTOR_TOOLBAR_TEXT,
} from "../constants";

interface AttendanceRosterTableProps {
  rows: AttendanceRowResponse[];
  isLoading: boolean;
  canEditSession: boolean;
  onRecordAttendance: (row: AttendanceRowResponse, targetStatus: AttendanceStatus) => void;
  onViewHistory: (row: AttendanceRowResponse) => void;
  onVerifyIdentity?: (row: AttendanceRowResponse) => void;
  /** Offered only for a Student whose latest attempt is in progress. */
  onForceSubmit?: (row: AttendanceRowResponse) => void;
  filters?: ReactNode;
  pagination?: ReactNode;
  toolbarActions?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function AttendanceRosterTable({
  rows,
  isLoading,
  canEditSession,
  onRecordAttendance,
  onViewHistory,
  onVerifyIdentity,
  onForceSubmit,
  filters,
  pagination,
  toolbarActions,
  searchValue,
  onSearchChange,
}: AttendanceRosterTableProps): ReactElement {
  const columns = useAttendanceColumns(canEditSession);

  const renderRowActions = (row: AttendanceRowResponse) => {
    const canEditRow = canEditSession && row.canEdit;

    const actionItems: DropdownItem[] = [];
    if (canEditRow && row.status !== "PRESENT") {
      actionItems.push({
        label: T.ACTION_PRESENT,
        tone: "success",
        onSelect: () => onRecordAttendance(row, "PRESENT"),
      });
    }
    if (canEditRow && row.status !== "LATE") {
      actionItems.push({
        label: T.ACTION_LATE,
        tone: "warning",
        onSelect: () => onRecordAttendance(row, "LATE"),
      });
    }
    if (canEditRow && row.status !== "ABSENT") {
      actionItems.push({
        label: T.ACTION_ABSENT,
        tone: "danger",
        onSelect: () => onRecordAttendance(row, "ABSENT"),
      });
    }
    if (canEditRow && row.status !== "UNMARKED") {
      actionItems.push({
        label: T.ACTION_RESET,
        tone: "neutral",
        onSelect: () => onRecordAttendance(row, "UNMARKED"),
      });
    }
    if (onVerifyIdentity) {
      actionItems.push({
        label: T.ACTION_VERIFY_IDENTITY,
        onSelect: () => onVerifyIdentity(row),
      });
    }
    if (
      onForceSubmit &&
      row.latestAttemptPublicId &&
      row.latestAttemptActivityStatus === ATTEMPT_IN_PROGRESS
    ) {
      actionItems.push({
        label: PROCTOR_FORCE_SUBMIT_TEXT.ACTION,
        tone: "danger",
        onSelect: () => onForceSubmit(row),
      });
    }
    actionItems.push({
      label: T.ACTION_VIEW_HISTORY,
      onSelect: () => onViewHistory(row),
    });

    return (
      <div className="flex items-center justify-end gap-1.5">
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
      showSearch={Boolean(onSearchChange)}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={PROCTOR_TOOLBAR_TEXT.SEARCH_PLACEHOLDER}
      searchAriaLabel={PROCTOR_TOOLBAR_TEXT.SEARCH_PLACEHOLDER}
      filters={filters}
      pagination={pagination}
      toolbarActions={toolbarActions}
    />
  );
}
