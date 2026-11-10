"use client";

import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import type { AttendanceStatus, AttendanceSummaryResponse } from "@pte/api-client";
import { getAttendanceStatusLabel, PROCTOR_TOOLBAR_TEXT as T } from "../constants";

interface AttendanceFilterToolbarProps {
  currentStatus: AttendanceStatus | "ALL";
  summary?: AttendanceSummaryResponse;
  onFilterChange: (status: AttendanceStatus | "ALL") => void;
}

/** Used in DataTable.filters by both the Host and Proctor attendance screens. */
export const AttendanceFilterToolbar = ({
  currentStatus,
  summary,
  onFilterChange,
}: AttendanceFilterToolbarProps): ReactElement => {
  const options: { value: AttendanceStatus | "ALL"; label: string; count?: number }[] = [
    { value: "ALL", label: T.ALL_TAB, count: summary?.totalEnrollments },
    {
      value: "UNMARKED",
      label: getAttendanceStatusLabel("UNMARKED"),
      count: summary?.unmarkedCount,
    },
    { value: "PRESENT", label: getAttendanceStatusLabel("PRESENT"), count: summary?.presentCount },
    { value: "LATE", label: getAttendanceStatusLabel("LATE"), count: summary?.lateCount },
    { value: "ABSENT", label: getAttendanceStatusLabel("ABSENT"), count: summary?.absentCount },
  ];
  return (
    <Select
      aria-label={T.FILTER_STATUS_LABEL}
      value={currentStatus}
      options={options.map((option) => ({
        value: option.value,
        label: option.count === undefined ? option.label : `${option.label} (${option.count})`,
      }))}
      onChange={(event) => {
        const selected = options.find((option) => option.value === event.target.value);
        if (selected) onFilterChange(selected.value);
      }}
    />
  );
};
