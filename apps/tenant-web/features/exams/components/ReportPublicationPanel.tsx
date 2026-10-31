"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, ConfirmDialog, useLocale, useToast } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { usePublishSessionReports, useReportPublicationSummary } from "../api";
import { useReportPublicationState } from "../hooks/useReportPublicationState";
import { REPORT_PUBLICATION_ANCHOR_ID } from "./ReportPublicationStatusChip";

interface ReportPublicationPanelProps {
  sessionPublicId: string;
  sessionStatus: string;
}

export const ReportPublicationPanel = ({
  sessionPublicId,
  sessionStatus,
}: ReportPublicationPanelProps): ReactElement => {
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { closed, publicationLocked, preflight } = useReportPublicationState(
    sessionPublicId,
    sessionStatus,
  );
  const publish = usePublishSessionReports(sessionPublicId);
  const publicationSummary = useReportPublicationSummary(
    sessionPublicId,
    closed && publicationLocked,
  );
  const pendingAnswers = countAnswerBlockers(preflight.data?.blockers ?? []);
  const error = errorMessage(publicationSummary.error ?? preflight.error ?? publish.error);
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
    loadingRecord: t("tenant.publication.loadingRecord", "Loading publication record…"),
    success: t("tenant.publication.success", "Reports were published for the session cohort."),
    checking: t("tenant.publication.checking", "Checking…"),
    notReady: (count: number) =>
      t("tenant.publication.notReady", `Cannot publish yet: ${count} answer(s) without a final score`, {
        count,
      }),
    allReady: (count: number) =>
      t(
        "tenant.publication.allReady",
        `All ${count} submitted attempts are ready to publish.`,
        { count },
      ),
    publishConfirm: (count: number) =>
      t(
        "tenant.publication.publishConfirm",
        `Publish immutable reports for all ${count} submitted attempts?`,
        { count },
      ),
    publishing: t("tenant.publication.publishing", "Publishing…"),
    approve: t("tenant.publication.approve", "Approve and publish"),
    attemptsReady: (ready: number, submitted: number) =>
      t("tenant.publication.attemptsReady", `${ready}/${submitted} submitted attempts ready`, {
        ready,
        submitted,
      }),
    answersPending: (count: number) =>
      t("tenant.publication.answersPending", `${count} answer(s) without a final score`, { count }),
  };
  /** Re-runs the readiness check on click, so the host never publishes from a stale result. */
  const requestPublish = async (): Promise<void> => {
    const { data } = await preflight.refetch();
    if (data?.canPublish) {
      setConfirmOpen(true);
    } else {
      showToast(text.notReady(countAnswerBlockers(data?.blockers ?? [])), { tone: "warning" });
    }
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
    <section
      id={REPORT_PUBLICATION_ANCHOR_ID}
      className="scroll-mt-6 flex flex-col gap-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
    >
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
        </div>
      )}
      {publicationLocked && publicationSummary.isLoading && (
        <p className="text-sm text-[var(--ink-secondary)]">{text.loadingRecord}</p>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {closed && !publicationLocked && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={preflight.isFetching || publish.isPending}
            onClick={() => void requestPublish()}
          >
            {publish.isPending
              ? text.publishing
              : preflight.isFetching
                ? text.checking
                : text.approve}
          </Button>
        </div>
      )}
      {closed && !publicationLocked && preflight.data && (
        <div className="flex flex-col gap-2 rounded-md bg-[var(--surface-subtle)] p-4 text-sm text-[var(--ink-primary)]">
          <p>
            {preflight.data.canPublish
              ? text.allReady(preflight.data.submittedAttemptCount)
              : [
                  text.attemptsReady(
                    preflight.data.readyAttemptCount,
                    preflight.data.submittedAttemptCount,
                  ),
                  pendingAnswers > 0 ? text.answersPending(pendingAnswers) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
          </p>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title={t("tenant.publication.publishTitle", "Publish reports?")}
        description={text.publishConfirm(preflight.data?.submittedAttemptCount ?? 0)}
        confirmLabel={text.approve}
        isConfirming={publish.isPending}
        onConfirm={() =>
          publish.mutate(undefined, {
            onSuccess: () => showToast(text.success, { tone: "success" }),
            onSettled: () => setConfirmOpen(false),
          })
        }
        onClose={() => setConfirmOpen(false)}
      />
    </section>
  );
};

function countAnswerBlockers(blockers: { answerPublicId?: string | null }[]): number {
  return blockers.filter((blocker) => blocker.answerPublicId).length;
}
