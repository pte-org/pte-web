"use client";

import type { ReactElement } from "react";
import type { AttendanceSummaryResponse } from "@pte/api-client";
import { StatCard } from "@pte/ui";
import { useAttendanceText } from "../hooks/useAttendanceText";

interface AttendanceSummaryCardsProps {
  summary?: AttendanceSummaryResponse;
  isLoading?: boolean;
}

export function AttendanceSummaryCards({
  summary,
  isLoading = false,
}: AttendanceSummaryCardsProps): ReactElement {
  const text = useAttendanceText();
  const total = summary?.totalEnrollments ?? 0;
  const unmarked = summary?.unmarkedCount ?? 0;
  const present = summary?.presentCount ?? 0;
  const absent = summary?.absentCount ?? 0;
  const late = summary?.lateCount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <StatCard
        label={text.summaryTotalLabel}
        value={isLoading ? "—" : String(total)}
        footnote={text.summaryTotalFootnote}
        accent="blue"
      />
      <StatCard
        label={text.statusUnmarked}
        value={isLoading ? "—" : String(unmarked)}
        footnote={text.summaryUnmarkedFootnote}
        accent="cream"
      />
      <StatCard
        label={text.statusPresent}
        value={isLoading ? "—" : String(present)}
        footnote={text.summaryPresentFootnote}
        accent="mint"
      />
      <StatCard
        label={text.statusAbsent}
        value={isLoading ? "—" : String(absent)}
        footnote={text.summaryAbsentFootnote}
        accent="blush"
      />
      <StatCard
        label={text.statusLate}
        value={isLoading ? "—" : String(late)}
        footnote={text.summaryLateFootnote}
        accent="cream"
      />
    </div>
  );
}
