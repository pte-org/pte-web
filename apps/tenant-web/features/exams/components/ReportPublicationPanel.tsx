"use client";

import { useState, type ReactElement } from "react";
import { ApiError, type ReportPublicationBlockerResponse } from "@pte/api-client";
import { Alert, Button, ConfirmDialog, useLocale } from "@pte/ui";
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
  const { locale, t } = useLocale();
  const [checked, setChecked] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
  const text = {
    title: t("tenant.publication.title", "Review and publish reports"),
    closeBeforeReadiness: t(
      "tenant.publication.closeBeforeReadiness",
      "Close the exam session before checking final publication readiness.",
    ),
    locked: t(
      "tenant.publication.locked",
      "This session has already been published; score changes are locked.",
    ),
    record: t("tenant.publication.record", "Publication record"),
    reportsPublished: (published: number, cohort: number) =>
      t("tenant.publication.reportsPublished", `${published}/${cohort} reports published`, {
        published,
        cohort,
      }),
    published: t("tenant.publication.published", "Published"),
    publication: t("tenant.publication.publication", "Publication"),
    host: t("tenant.publication.host", "Host"),
    loadingRecord: t("tenant.publication.loadingRecord", "Loading publication record…"),
    attempt: t("tenant.publication.attempt", "Attempt"),
    success: t("tenant.publication.success", "Reports were published for the session cohort."),
    checking: t("tenant.publication.checking", "Checking…"),
    checkReadiness: t("tenant.publication.checkReadiness", "Check readiness"),
    publishConfirm: (count: number) =>
      t(
        "tenant.publication.publishConfirm",
        `Publish immutable reports for all ${count} submitted attempts?`,
        { count },
      ),
    publishing: t("tenant.publication.publishing", "Publishing…"),
    approve: t("tenant.publication.approve", "Approve and publish"),
    attemptsReady: (ready: number, submitted: number, blockers: number) =>
      t(
        "tenant.publication.attemptsReady",
        `${ready}/${submitted} submitted attempts ready; ${blockers} blocking answer(s).`,
        { ready, submitted, blockers },
      ),
    showingFirst: t("tenant.publication.showingFirst", "Showing first 20 blockers."),
  };
  const formatDate = (value: string): string => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
      <div>
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">{text.title}</h3>
      </div>
      {!closed && <Alert tone="warning">{text.closeBeforeReadiness}</Alert>}
      {publicationLocked && <Alert tone="warning">{text.locked}</Alert>}
      {publicationLocked && publicationSummary.data && (
        <div className="rounded-md bg-[var(--surface-subtle)] p-4 text-sm text-[var(--ink-primary)]">
          <p className="font-medium text-[var(--ink-primary)]">{text.record}</p>
          <p className="mt-1">
            {text.reportsPublished(
              publicationSummary.data.publishedReportCount,
              publicationSummary.data.cohortSize,
            )}
            {" · "}
            {text.published} {formatDate(publicationSummary.data.publishedAt)}
          </p>
          <p className="mt-1 break-all text-xs text-[var(--ink-muted)]">
            {text.publication} {publicationSummary.data.publicationPublicId} · {text.host}{" "}
            {publicationSummary.data.publishedByPublicId}
          </p>
        </div>
      )}
      {publicationLocked && publicationSummary.isLoading && (
        <p className="text-sm text-[var(--ink-secondary)]">{text.loadingRecord}</p>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {failedPublishBlockers.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-[var(--blush-action)]">
          {failedPublishBlockers.slice(0, 20).map((blocker, index) => (
            <li key={`${blocker.attemptPublicId}-${blocker.answerPublicId ?? index}`}>
              {blocker.section ?? text.attempt} {blocker.taskType ?? blocker.attemptPublicId}:{" "}
              {blocker.reason}
              {blocker.answerPublicId ? ` (${blocker.answerPublicId})` : ""}
            </li>
          ))}
        </ul>
      )}
      {publish.isSuccess && <Alert tone="success">{text.success}</Alert>}
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
          {preflight.isFetching ? text.checking : text.checkReadiness}
        </Button>
        {canPublish && (
          <Button type="button" disabled={publish.isPending} onClick={() => setConfirmOpen(true)}>
            {publish.isPending ? text.publishing : text.approve}
          </Button>
        )}
      </div>
      {checked && preflight.data && (
        <div className="flex flex-col gap-2 rounded-md bg-[var(--surface-subtle)] p-4 text-sm text-[var(--ink-primary)]">
          <p>
            {text.attemptsReady(
              preflight.data.readyAttemptCount,
              preflight.data.submittedAttemptCount,
              preflight.data.blockerCount,
            )}
          </p>
          {preflight.data.blockers.length > 0 && (
            <ul className="list-disc pl-5 text-[var(--blush-action)]">
              {preflight.data.blockers.slice(0, 20).map((blocker, index) => (
                <li key={`${blocker.attemptPublicId}-${blocker.answerPublicId ?? index}`}>
                  {blocker.section ?? text.attempt} {blocker.taskType ?? blocker.attemptPublicId}:{" "}
                  {blocker.reason}
                  {blocker.answerPublicId ? ` (${blocker.answerPublicId})` : ""}
                </li>
              ))}
            </ul>
          )}
          {preflight.data.blockers.length > 20 && <p>{text.showingFirst}</p>}
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title={t("tenant.publication.publishTitle", "Publish reports?")}
        description={text.publishConfirm(preflight.data?.submittedAttemptCount ?? 0)}
        confirmLabel={text.approve}
        isConfirming={publish.isPending}
        onConfirm={() => publish.mutate(undefined, { onSettled: () => setConfirmOpen(false) })}
        onClose={() => setConfirmOpen(false)}
      />
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
