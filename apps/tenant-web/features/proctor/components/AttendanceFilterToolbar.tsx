"use client";

import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import type { AttendanceStatus, AttendanceSummaryResponse } from "@pte/api-client";
import { useAttendanceText } from "../hooks/useAttendanceText";

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
  const text = useAttendanceText();
  const options: { value: AttendanceStatus | "ALL"; label: string; count?: number }[] = [
    { value: "ALL", label: text.filterAll, count: summary?.totalEnrollments },
    {
      value: "UNMARKED",
      label: text.statusLabel("UNMARKED"),
      count: summary?.unmarkedCount,
    },
    { value: "PRESENT", label: text.statusLabel("PRESENT"), count: summary?.presentCount },
    { value: "LATE", label: text.statusLabel("LATE"), count: summary?.lateCount },
    { value: "ABSENT", label: text.statusLabel("ABSENT"), count: summary?.absentCount },
  ];
  return (
    <Select
      aria-label={text.filterStatusLabel}
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
