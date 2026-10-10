"use client";

import type { ReactElement } from "react";
import type { StudentPerformanceResponse } from "@pte/api-client";
import { Badge, LoadingState, ProgressBar, StatCard } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useStudentPerformance } from "../api";
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
  const performance = useStudentPerformance(studentPublicId, {}, active);

  if (performance.isLoading) return <LoadingState rows={5} />;
  if (performance.isError || !performance.data) {
    return (
      <StudentDetailStateMessage
        message={getUserFacingApiErrorMessage(performance.error, text.genericError)}
      />
    );
  }

  return <PerformanceContent data={performance.data} text={text} />;
};

interface PerformanceContentProps {
  data: StudentPerformanceResponse;
  text: StudentDetailText;
}

const PerformanceContent = ({ data, text }: PerformanceContentProps): ReactElement => (
  <div className="flex flex-col gap-5">
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
          const hasScore = score !== null;

          return (
            <div
              key={skill.skill}
              className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-[var(--ink-primary)]">{skillLabel}</span>
                {hasScore ? (
                  <span className="text-lg font-semibold text-[var(--brand-ink)]">{score}</span>
                ) : (
                  <Badge variant="neutral">{text.overview.insufficientData}</Badge>
                )}
              </div>
              {hasScore ? (
                <ProgressBar
                  value={score}
                  max={90}
                  label={text.overview.progressLabel(skillLabel)}
                  className="mt-4"
                />
              ) : (
                <p className="mt-4 text-xs text-[var(--ink-muted)]">
                  {text.overview.noScoredAttempt}
                </p>
              )}
              <p className="mt-2 text-xs text-[var(--ink-muted)]">
                {text.overview.reportCount(skill.sampleCount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
