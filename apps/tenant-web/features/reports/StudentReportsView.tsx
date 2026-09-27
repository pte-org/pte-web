"use client";

import type { ReactElement } from "react";
import { Alert, LoadingState, PageHeader } from "@pte/ui";
import { useMyReports } from "./api";

export const StudentReportsView = (): ReactElement => {
  const reports = useMyReports();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="My results" subtitle="Published exam reports from your organization." />
      {reports.data?.some((report) => !report.immutableSnapshot) && (
        <Alert tone="warning">
          Some earlier results were published before immutable snapshots existed. They retain the
          previous live-scoring behavior and may change; reports published with the current workflow are frozen.
        </Alert>
      )}
      {reports.isLoading && <LoadingState rows={4} />}
      {reports.error && (
        <Alert tone="error">Unable to load your published results. Please try again.</Alert>
      )}
      {reports.data?.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-900">No published results yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your results will appear here after your Host publishes them.
          </p>
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
                <h2 className="font-semibold text-gray-900">Exam report</h2>
                <p className="mt-1 text-xs text-gray-500">Session {report.sessionPublicId}</p>
                {!report.immutableSnapshot && (
                  <p className="mt-1 text-xs font-medium text-amber-700">Legacy result · not frozen</p>
                )}
              </div>
              <time className="text-sm text-gray-500">
                {report.publishedAt
                  ? new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(report.publishedAt))
                  : "Published"}
              </time>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {report.overall && (
                <ScoreCard
                  label="Overall"
                  score={report.overall.score}
                  sufficient={report.overall.sufficientData}
                />
              )}
              {report.communicativeSkills.map((skill) => (
                <ScoreCard
                  key={skill.skill}
                  label={skill.skill}
                  score={skill.score}
                  sufficient={skill.sufficientData}
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
}: {
  label: string;
  score: number | null;
  sufficient: boolean;
}): ReactElement {
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">
        {sufficient && score !== null ? score : "—"}
      </div>
      {!sufficient && <div className="mt-1 text-xs text-gray-500">Insufficient data</div>}
    </div>
  );
}
