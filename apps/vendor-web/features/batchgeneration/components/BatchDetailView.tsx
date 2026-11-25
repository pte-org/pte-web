"use client";

import { useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import {
  Alert,
  Button,
  ConfirmDialog,
  DashboardCard,
  DashboardLoadingState,
  PageHeader,
  useDashboardBreadcrumbLabel,
  useLocale,
  useToast,
} from "@pte/ui";
import { useCancelQuestionGenerationBatch, useQuestionGenerationBatch } from "../api";
import { CANCELLABLE_BATCH_STATUSES } from "../constants";
import { useBatchMessages } from "../messages/useBatchMessages";
import { batchErrorMessage } from "../utils/batchError";
import { failureLabel } from "../../questiongeneration/utils/failureLabel";
import { LiveJobPanel } from "../../questiongeneration/components/LiveJobPanel";
import { focusedJobId, jobHasStarted } from "../utils/jobExpansion";
import { BatchSidebar } from "./_BatchSidebar";
import { nextJobFilter, type JobFilter } from "../utils/jobFilter";

interface BatchDetailViewProps {
  batchId: string;
}

/** One batch: progress, lanes and jobs on the left; the picked (or first running) job followed live on the right. */
export const BatchDetailView = ({ batchId }: BatchDetailViewProps): ReactElement => {
  const messages = useBatchMessages();
  const { locale } = useLocale();
  const pathname = usePathname();
  const { showToast } = useToast();
  const { data: batch, isLoading, error } = useQuestionGenerationBatch(batchId);
  const cancel = useCancelQuestionGenerationBatch();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [jobFilter, setJobFilter] = useState<JobFilter>("all");
  const [pickedJob, setPickedJob] = useState<string | null>(null);
  useDashboardBreadcrumbLabel(pathname, batch ? messages.detailTitle : undefined);

  if (isLoading) return <DashboardLoadingState variant="table" />;
  if (error || !batch) {
    return <Alert tone="error">{batchErrorMessage(error, messages, "detailLoadError")}</Alert>;
  }

  const handleCancel = (): void =>
    cancel.mutate(batch.publicId, {
      onSuccess: () => showToast(messages.cancelled, { tone: "success" }),
      onError: (cancelError) =>
        showToast(batchErrorMessage(cancelError, messages, "cancelError"), { tone: "error" }),
      onSettled: () => setConfirmingCancel(false),
    });
  const focusedId = focusedJobId(batch.children, pickedJob, batch.currentJobPublicId);
  const focused = batch.children.find((job) => job.jobPublicId === focusedId);
  const canCancel = CANCELLABLE_BATCH_STATUSES.includes(batch.status);
  const actions = canCancel ? (
    <Button type="button" variant="danger" onClick={() => setConfirmingCancel(true)}>
      {messages.cancelBatch}
    </Button>
  ) : undefined;

  return (
    <div className="space-y-4">
      <PageHeader title={messages.detailTitle} actions={actions} />
      {batch.failureCode ? (
        <Alert tone="warning">{`${messages.summaryFailure}: ${failureLabel(batch.failureCode, locale === "vi" ? "vi" : "en")}`}</Alert>
      ) : null}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        <aside className="xl:sticky xl:top-4">
          <BatchSidebar
            batch={batch}
            messages={messages}
            focusedId={focusedId}
            onFocus={setPickedJob}
            filter={jobFilter}
            onFilter={(clicked) => setJobFilter((current) => nextJobFilter(current, clicked))}
          />
        </aside>
        <DashboardCard>
          {focused && jobHasStarted(focused.status) ? (
            <LiveJobPanel key={focused.jobPublicId} jobId={focused.jobPublicId} />
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">
              {focused ? messages.jobWaiting : messages.focusEmpty}
            </p>
          )}
        </DashboardCard>
      </div>
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
