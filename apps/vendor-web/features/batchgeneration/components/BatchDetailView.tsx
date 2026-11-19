"use client";

import { useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { Alert, Button, ConfirmDialog, DashboardLoadingState, PageHeader, useDashboardBreadcrumbLabel, useLocale, useToast } from "@pte/ui";
import { useCancelQuestionGenerationBatch, useQuestionGenerationBatch } from "../api";
import { CANCELLABLE_BATCH_STATUSES } from "../constants";
import { useBatchMessages } from "../messages/useBatchMessages";
import { batchErrorMessage } from "../utils/batchError";
import { failureLabel } from "../../questiongeneration/utils/failureLabel";
import { BatchJobList } from "./_BatchJobList";
import { BatchSummaryCard } from "./_BatchSummaryCard";
import { nextJobFilter, type JobFilter } from "../utils/jobFilter";

interface BatchDetailViewProps {
  batchId: string;
}

/** One batch: progress polled while it is open, its jobs (each opening onto its generation) and cancel. */
export const BatchDetailView = ({ batchId }: BatchDetailViewProps): ReactElement => {
  const messages = useBatchMessages();
  const { locale } = useLocale();
  const pathname = usePathname();
  const { showToast } = useToast();
  const { data: batch, isLoading, error } = useQuestionGenerationBatch(batchId);
  const cancel = useCancelQuestionGenerationBatch();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [jobFilter, setJobFilter] = useState<JobFilter>("all");
  useDashboardBreadcrumbLabel(pathname, batch ? messages.detailTitle : undefined);

  if (isLoading) return <DashboardLoadingState variant="table" />;
  if (error || !batch) {
    return <Alert tone="error">{batchErrorMessage(error, messages, "detailLoadError")}</Alert>;
  }

  const handleCancel = (): void =>
    cancel.mutate(batch.publicId, {
      onSuccess: () => showToast(messages.cancelled, { tone: "success" }),
      onError: (cancelError) => showToast(batchErrorMessage(cancelError, messages, "cancelError"), { tone: "error" }),
      onSettled: () => setConfirmingCancel(false),
    });
  const canCancel = CANCELLABLE_BATCH_STATUSES.includes(batch.status);
  const actions = canCancel ? (
    <Button type="button" variant="danger" onClick={() => setConfirmingCancel(true)}>{messages.cancelBatch}</Button>
  ) : undefined;

  return (
    <div className="space-y-4">
      <PageHeader title={messages.detailTitle} actions={actions} />
      {batch.failureCode ? (
        <Alert tone="warning">{`${messages.summaryFailure}: ${failureLabel(batch.failureCode, locale === "vi" ? "vi" : "en")}`}</Alert>
      ) : null}
      <BatchSummaryCard batch={batch} messages={messages} filter={jobFilter}
        onFilter={(clicked) => setJobFilter((current) => nextJobFilter(current, clicked))} />
      <BatchJobList jobs={batch.children} currentJobId={batch.currentJobPublicId} messages={messages} filter={jobFilter} />
      <ConfirmDialog
        open={confirmingCancel}
        title={messages.cancelTitle}
        description={messages.cancelDescription}
        confirmLabel={messages.cancelConfirm}
        cancelLabel={messages.cancelKeep}
        tone="danger"
        isConfirming={cancel.isPending}
        onConfirm={handleCancel}
        onClose={() => setConfirmingCancel(false)}
      />
    </div>
  );
};
