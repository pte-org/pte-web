"use client";

import type { ReactElement } from "react";
import type { AttendanceSummaryResponse } from "@pte/api-client";
import { StatCard } from "@pte/ui";
import { PROCTOR_ATTENDANCE_SUMMARY_TEXT as T } from "../constants";

interface AttendanceSummaryCardsProps {
  summary?: AttendanceSummaryResponse;
  isLoading?: boolean;
}

export function AttendanceSummaryCards({
  summary,
  isLoading = false,
}: AttendanceSummaryCardsProps): ReactElement {
  const total = summary?.totalEnrollments ?? 0;
  const unmarked = summary?.unmarkedCount ?? 0;
  const present = summary?.presentCount ?? 0;
  const absent = summary?.absentCount ?? 0;
  const late = summary?.lateCount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <StatCard
        label={T.TOTAL_STUDENTS_LABEL}
        value={isLoading ? "—" : String(total)}
        footnote={T.TOTAL_STUDENTS_FOOTNOTE}
        accent="blue"
      />
      <StatCard
        label={T.UNMARKED_LABEL}
        value={isLoading ? "—" : String(unmarked)}
        footnote={T.UNMARKED_FOOTNOTE}
        accent="cream"
      />
      <StatCard
        label={T.PRESENT_LABEL}
        value={isLoading ? "—" : String(present)}
        footnote={T.PRESENT_FOOTNOTE}
        accent="mint"
      />
      <StatCard
        label={T.ABSENT_LABEL}
        value={isLoading ? "—" : String(absent)}
        footnote={T.ABSENT_FOOTNOTE}
        accent="blush"
      />
      <StatCard
        label={T.LATE_LABEL}
        value={isLoading ? "—" : String(late)}
        footnote={T.LATE_FOOTNOTE}
        accent="cream"
      />
    </div>
  );
}
