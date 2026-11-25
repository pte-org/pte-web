"use client";

import { type ReactElement, type ReactNode } from "react";
import { ActionMenu, DataTable, type DropdownItem } from "@pte/ui";
import { useAttendanceColumns } from "../hooks/useAttendanceColumns";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import {
  ATTEMPT_IN_PROGRESS,
  ATTEMPT_SUBMITTED,
} from "../constants";
import { useAttendanceText } from "../hooks/useAttendanceText";

interface AttendanceRosterTableProps {
  rows: AttendanceRowResponse[];
  isLoading: boolean;
  canEditSession: boolean;
  onRecordAttendance: (row: AttendanceRowResponse, targetStatus: AttendanceStatus) => void;
  onViewHistory: (row: AttendanceRowResponse) => void;
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
  onForceSubmit,
  filters,
  pagination,
  toolbarActions,
  searchValue,
  onSearchChange,
}: AttendanceRosterTableProps): ReactElement {
  const columns = useAttendanceColumns();
  const text = useAttendanceText();

  const renderRowActions = (row: AttendanceRowResponse) => {
    const canEditRow = canEditSession && row.canEdit;

    const actionItems: DropdownItem[] = [];
    if (canEditRow && row.status !== "PRESENT") {
      actionItems.push({
        label: text.actionPresent,
        tone: "success",
        onSelect: () => onRecordAttendance(row, "PRESENT"),
      });
    }
    if (canEditRow && row.status !== "LATE") {
      actionItems.push({
        label: text.actionLate,
        tone: "warning",
        onSelect: () => onRecordAttendance(row, "LATE"),
      });
    }
    // A student who has started or submitted the exam attended it; the API rejects ABSENT too.
    const hasStartedExam =
      row.latestAttemptActivityStatus === ATTEMPT_IN_PROGRESS ||
      row.latestAttemptActivityStatus === ATTEMPT_SUBMITTED;
    if (canEditRow && row.status !== "ABSENT" && !hasStartedExam) {
      actionItems.push({
        label: text.actionAbsent,
        tone: "danger",
        onSelect: () => onRecordAttendance(row, "ABSENT"),
      });
    }
    if (canEditRow && row.status !== "UNMARKED") {
      actionItems.push({
        label: text.actionReset,
        tone: "neutral",
        onSelect: () => onRecordAttendance(row, "UNMARKED"),
      });
    }
    if (
      onForceSubmit &&
      row.latestAttemptPublicId &&
      row.latestAttemptActivityStatus === ATTEMPT_IN_PROGRESS
    ) {
      actionItems.push({
        label: text.forceSubmitAction,
        tone: "danger",
        onSelect: () => onForceSubmit(row),
      });
    }
    actionItems.push({
      label: text.actionViewHistory,
      onSelect: () => onViewHistory(row),
    });

    return (
      <div className="flex items-center justify-end gap-1.5">
        <ActionMenu items={actionItems} label={text.actionMenuLabel} />
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.studentPublicId}
      isLoading={isLoading}
      emptyTitle={text.rosterEmpty}
      rowActions={renderRowActions}
      clientSideFiltering={false}
      clientSideSorting={false}
      clientSidePagination={false}
      showSearch={Boolean(onSearchChange)}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={text.searchPlaceholder}
      searchAriaLabel={text.searchPlaceholder}
      filters={filters}
      pagination={pagination}
      toolbarActions={toolbarActions}
    />
  );
}
