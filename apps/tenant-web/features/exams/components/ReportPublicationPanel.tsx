"use client";

import { useState, type ReactElement } from "react";
import { ApiError, type ReportPublicationBlockerResponse } from "@pte/api-client";
import { Alert, Button } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  useHostScoreReview,
  usePublishSessionReports,
  useReportPublicationPreflight,
  useReportPublicationSummary,
} from "../api";

interface ReportPublicationPanelProps {
  sessionPublicId: string;
  sessionStatus: string;
}

export const ReportPublicationPanel = ({
  sessionPublicId,
  sessionStatus,
}: ReportPublicationPanelProps): ReactElement => {
  const [checked, setChecked] = useState(false);
  const review = useHostScoreReview(sessionPublicId);
  const preflight = useReportPublicationPreflight(sessionPublicId, checked);
  const publish = usePublishSessionReports(sessionPublicId);
  const closed = sessionStatus === "CLOSED";
  const publicationLocked = review.data?.publicationLocked ?? false;
  const publicationSummary = useReportPublicationSummary(
    sessionPublicId,
    closed && publicationLocked,
  );
  const canPublish =
    closed && preflight.data?.canPublish && !preflight.isFetching && !publicationLocked;
  const error = errorMessage(publicationSummary.error ?? preflight.error ?? publish.error);
  const failedPublishBlockers = publicationBlockersFromError(publish.error);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Review and publish reports</h3>
        <p className="mt-1 text-sm text-gray-600">
          Student results are frozen from the selected AI/Examiner scores and the score template
          pinned to this exam.
        </p>
      </div>
      {!closed && (
        <Alert tone="warning">
          Close the exam session before checking final publication readiness.
        </Alert>
      )}
      {publicationLocked && (
        <Alert tone="warning">
          This session has already been published; score changes are locked.
        </Alert>
      )}
      {publicationLocked && publicationSummary.data && (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-medium text-gray-900">Publication record</p>
          <p className="mt-1">
            {publicationSummary.data.publishedReportCount}/{publicationSummary.data.cohortSize}{" "}
            reports published
            {" · "}Published {new Date(publicationSummary.data.publishedAt).toLocaleString()}
          </p>
          <p className="mt-1 break-all text-xs text-gray-500">
            Publication {publicationSummary.data.publicationPublicId} · Host{" "}
            {publicationSummary.data.publishedByPublicId}
          </p>
        </div>
      )}
      {publicationLocked && publicationSummary.isLoading && (
        <p className="text-sm text-gray-500">Loading publication record…</p>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {failedPublishBlockers.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-red-700">
          {failedPublishBlockers.slice(0, 20).map((blocker, index) => (
            <li key={`${blocker.attemptPublicId}-${blocker.answerPublicId ?? index}`}>
              {blocker.section ?? "Attempt"} {blocker.taskType ?? blocker.attemptPublicId}:{" "}
              {blocker.reason}
              {blocker.answerPublicId ? ` (${blocker.answerPublicId})` : ""}
            </li>
          ))}
        </ul>
      )}
      {publish.isSuccess && (
        <Alert tone="success">Reports were published for the session cohort.</Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!closed || preflight.isFetching || publicationLocked}
          onClick={() => {
            if (checked) {
              void preflight.refetch();
            } else {
              setChecked(true);
            }
          }}
        >
          {preflight.isFetching ? "Checking…" : "Check readiness"}
        </Button>
        {canPublish && (
          <Button
            type="button"
            disabled={publish.isPending}
            onClick={() => {
              const count = preflight.data?.submittedAttemptCount ?? 0;
              if (
                window.confirm(`Publish immutable reports for all ${count} submitted attempts?`)
              ) {
                publish.mutate();
              }
            }}
          >
            {publish.isPending ? "Publishing…" : "Approve and publish"}
          </Button>
        )}
      </div>
      {checked && preflight.data && (
        <div className="flex flex-col gap-2 rounded-md bg-gray-50 p-4 text-sm">
          <p>
            {preflight.data.readyAttemptCount}/{preflight.data.submittedAttemptCount} submitted
            attempts ready; {preflight.data.blockerCount} blocking answer(s).
          </p>
          {preflight.data.blockers.length > 0 && (
            <ul className="list-disc pl-5 text-red-700">
              {preflight.data.blockers.slice(0, 20).map((blocker, index) => (
                <li key={`${blocker.attemptPublicId}-${blocker.answerPublicId ?? index}`}>
                  {blocker.section ?? "Attempt"} {blocker.taskType ?? blocker.attemptPublicId}:{" "}
                  {blocker.reason}
                  {blocker.answerPublicId ? ` (${blocker.answerPublicId})` : ""}
                </li>
              ))}
            </ul>
          )}
          {preflight.data.blockers.length > 20 && <p>Showing first 20 blockers.</p>}
        </div>
      )}
    </section>
  );
};

function publicationBlockersFromError(error: unknown): ReportPublicationBlockerResponse[] {
  if (!(error instanceof ApiError) || typeof error.details !== "object" || error.details === null)
    return [];
  const data = (error.details as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is ReportPublicationBlockerResponse =>
      typeof item === "object" && item !== null && "attemptPublicId" in item && "reason" in item,
  );
}
