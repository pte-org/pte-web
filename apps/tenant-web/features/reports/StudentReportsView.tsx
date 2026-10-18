"use client";

import type { ReactElement } from "react";
import { Alert, LoadingState, PageHeader } from "@pte/ui";
import { useMyReports } from "./api";
import { formatWeightBreakdown, REPORT_TEXT as T } from "./constants";

export const StudentReportsView = (): ReactElement => {
  const reports = useMyReports();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />
      {reports.data?.some((report) => !report.immutableSnapshot) && (
        <Alert tone="warning">{T.LEGACY_WARNING}</Alert>
      )}
      {reports.isLoading && <LoadingState rows={4} />}
      {reports.error && <Alert tone="error">{T.LOAD_ERROR}</Alert>}
      {reports.data?.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-900">{T.EMPTY_TITLE}</h2>
          <p className="mt-2 text-sm text-gray-600">{T.EMPTY_TEXT}</p>
        </div>
      )}
      <div className="grid gap-4">
        {reports.data?.map((report) => (
          <article
            key={report.attemptPublicId}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">{T.EXAM_REPORT}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {T.SESSION} {report.sessionPublicId}
                </p>
                {!report.immutableSnapshot && (
                  <p className="mt-1 text-xs font-medium text-amber-700">{T.LEGACY_RESULT}</p>
                )}
              </div>
              <time className="text-sm text-gray-500">
                {report.publishedAt
                  ? new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(report.publishedAt))
                  : T.PUBLISHED}
              </time>
            </div>
            {(report.overall?.appliedWeight !== null ||
              report.communicativeSkills.some((skill) => skill.appliedWeight !== null)) && (
              <p className="mt-3 text-xs text-gray-500">{T.WEIGHT_SNAPSHOT_NOTE}</p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {report.overall && (
                <ScoreCard
                  label={T.OVERALL}
                  score={report.overall.score}
                  sufficient={report.overall.sufficientData}
                  appliedWeight={report.overall.appliedWeight}
                />
              )}
              {report.communicativeSkills.map((skill) => (
                <ScoreCard
                  key={skill.skill}
                  label={skill.skill}
                  score={skill.score}
                  sufficient={skill.sufficientData}
                  appliedWeight={skill.appliedWeight}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

function ScoreCard({
  label,
  score,
  sufficient,
  appliedWeight,
}: {
  label: string;
  score: number | null;
  sufficient: boolean;
  appliedWeight: number | null;
}): ReactElement {
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">
        {sufficient && score !== null ? score : T.EMPTY_VALUE}
      </div>
      {!sufficient && <div className="mt-1 text-xs text-gray-500">{T.INSUFFICIENT_DATA}</div>}
      {appliedWeight !== null && (
        <div className="mt-2 text-xs text-gray-500">
          {T.APPLIED_WEIGHT}: {formatWeightBreakdown(appliedWeight)}
        </div>
      )}
    </div>
  );
}
