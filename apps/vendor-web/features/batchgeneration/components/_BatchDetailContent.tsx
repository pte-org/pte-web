"use client";

import { useState, type ReactElement } from "react";
import type {
  QuestionGenerationBatchQuestion,
  QuestionGenerationBatchResponse,
} from "@pte/api-client";
import {
  Alert,
  Button,
  ConfirmDialog,
  DashboardCard,
  PageHeader,
  useLocale,
  useToast,
} from "@pte/ui";
import { useCancelQuestionGenerationBatch } from "../api";
import { CANCELLABLE_BATCH_STATUSES } from "../constants";
import { useBatchFocus } from "../hooks/useBatchFocus";
import type { BatchMessages } from "../messages/en";
import { batchErrorMessage } from "../utils/batchError";
import { nextJobFilter, type JobFilter } from "../utils/jobFilter";
import { failureLabel } from "../../questiongeneration/utils/failureLabel";
import { LiveJobPanel } from "../../questiongeneration/components/LiveJobPanel";
import { BatchFocusNav } from "./_BatchFocusNav";
import { BatchResults } from "./_BatchResults";
import { BatchSidebar } from "./_BatchSidebar";

interface BatchDetailContentProps {
  batch: QuestionGenerationBatchResponse;
  slots: readonly QuestionGenerationBatchQuestion[];
  messages: BatchMessages;
}

/**
 * The loaded batch. The job being watched stays on screen until the person moves on, even after the server finished
 * it or the whole batch; the other jobs keep running meanwhile.
 */
export const BatchDetailContent = ({
  batch,
  slots,
  messages,
}: BatchDetailContentProps): ReactElement => {
  const { locale } = useLocale();
  const { showToast } = useToast();
  const cancel = useCancelQuestionGenerationBatch();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [jobFilter, setJobFilter] = useState<JobFilter>("all");
  const focus = useBatchFocus(batch);
  const focused = batch.children.find((job) => job.jobPublicId === focus.focusedId);

  const handleCancel = (): void =>
    cancel.mutate(batch.publicId, {
      onSuccess: () => showToast(messages.cancelled, { tone: "success" }),
      onError: (cancelError) =>
        showToast(batchErrorMessage(cancelError, messages, "cancelError"), { tone: "error" }),
      onSettled: () => setConfirmingCancel(false),
    });
  const actions = CANCELLABLE_BATCH_STATUSES.includes(batch.status) ? (
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
            focusedId={focus.focusedId}
            onFocus={focus.focus}
            unseen={focus.unseen}
            filter={jobFilter}
            onFilter={(clicked) => setJobFilter((current) => nextJobFilter(current, clicked))}
          />
        </aside>
        <DashboardCard>
          {focus.showResults ? (
            <BatchResults
              batchId={batch.publicId}
              slots={slots}
              messages={messages}
              onWatch={focus.focus}
            />
          ) : (
            <div className="space-y-3">
              <BatchFocusNav focus={focus} messages={messages} />
              {focused ? (
                <LiveJobPanel
                  key={focused.jobPublicId}
                  jobId={focused.jobPublicId}
                  onReplayDone={focus.setReplayDone}
                />
              ) : (
                <p className="text-sm text-[var(--ink-muted)]">{messages.focusEmpty}</p>
              )}
            </div>
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
