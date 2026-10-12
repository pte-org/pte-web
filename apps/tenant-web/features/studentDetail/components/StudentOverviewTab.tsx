"use client";

import { useState, type ReactElement } from "react";
import type { StudentPerformanceResponse } from "@pte/api-client";
import {
  CircularProgressChart,
  DashboardCard,
  DateRangePicker,
  LoadingState,
  StatCard,
  type DateRangeValue,
} from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useStudentPerformance } from "../api";
import { STUDENT_SCORE_MAX } from "../constants";
import type { StudentDetailText } from "../hooks/useStudentDetailText";
import { formatStudentDate } from "../utils";
import { StudentDetailStateMessage } from "./StudentDetailStateMessage";

interface StudentOverviewTabProps {
  studentPublicId: string;
  active: boolean;
  text: StudentDetailText;
}

export const StudentOverviewTab = ({
  studentPublicId,
  active,
  text,
}: StudentOverviewTabProps): ReactElement => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const performance = useStudentPerformance(studentPublicId, dateRange, active);

  if (performance.isLoading) return <LoadingState rows={5} />;
  if (performance.isError || !performance.data) {
    return (
      <StudentDetailStateMessage
        message={getUserFacingApiErrorMessage(performance.error, text.genericError)}
      />
    );
  }

  return (
    <PerformanceContent
      data={performance.data}
      text={text}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
    />
  );
};

interface PerformanceContentProps {
  data: StudentPerformanceResponse;
  text: StudentDetailText;
  dateRange: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;
}

const PerformanceContent = ({
  data,
  text,
  dateRange,
  onDateRangeChange,
}: PerformanceContentProps): ReactElement => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
          {text.overview.dateRange}
        </h2>
        <p className="mt-1 text-xs text-[var(--ink-secondary)]">
          {text.overview.dateRangeDescription}
        </p>
      </div>
      <DateRangePicker
        ariaLabel={text.overview.dateRangeAriaLabel}
        value={dateRange}
        onChange={onDateRangeChange}
        fromLabel={text.history.from}
        toLabel={text.history.to}
        className="sm:w-56"
      />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label={text.overview.attemptCount} value={String(data.attemptCount)} compact />
      <StatCard
        label={text.overview.averageOverall}
        value={
          data.averageOverallAvailable && data.averageOverall !== null
            ? String(data.averageOverall)
            : text.emptyValue
        }
        compact
        footnote={
          data.averageOverallAvailable
            ? text.overview.averageFromPublished
            : text.overview.averageInsufficient
        }
      />
      <StatCard
        label={text.overview.latestAttempt}
        value={
          data.latestAttemptAt
            ? formatStudentDate(data.latestAttemptAt, text.locale)
            : text.emptyValue
        }
        compact
      />
    </div>
    <div>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">
          {text.overview.skillTitle}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">{text.overview.skillDescription}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.skills.map((skill) => {
          const skillLabel = text.skillLabel(skill.skill);
          const score = skill.available ? skill.averageScore : null;

          return (
            <DashboardCard key={skill.skill} className="flex items-center gap-4">
              <CircularProgressChart
                value={score}
                max={STUDENT_SCORE_MAX}
                valueLabel={score === null ? text.emptyValue : String(score)}
                ariaLabel={text.overview.progressLabel(skillLabel)}
                caption={score === null ? text.overview.insufficientData : text.overview.scoreScale}
              />
              <div className="min-w-0">
                <h3 className="font-medium text-[var(--ink-primary)]">{skillLabel}</h3>
                <p className="mt-2 text-xs text-[var(--ink-muted)]">
                  {score === null
                    ? text.overview.noScoredAttempt
                    : text.overview.reportCount(skill.sampleCount)}
                </p>
              </div>
            </DashboardCard>
          );
        })}
      </div>
    </div>
  </div>
);
