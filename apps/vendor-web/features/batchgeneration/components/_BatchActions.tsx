"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";
import { Button, useLocale, useToast } from "@pte/ui";
import { usePauseQuestionGenerationBatch, useResumeQuestionGenerationBatch } from "../api";
import { CANCELLABLE_BATCH_STATUSES, PAUSABLE_BATCH_STATUSES } from "../constants";
import type { BatchMessages } from "../messages/en";
import { batchErrorMessage } from "../utils/batchError";

interface BatchActionsProps {
  batch: QuestionGenerationBatchResponse;
  messages: BatchMessages;
  onCancel: () => void;
}

/**
 * Pause or resume beside the cancel. A pause loses nothing (the questions being written start over), so it needs no
 * confirmation; while the running jobs are being stopped the button waits.
 */
export const BatchActions = ({ batch, messages, onCancel }: BatchActionsProps): ReactElement | null => {
  const { locale } = useLocale();
  const { showToast } = useToast();
  const pause = usePauseQuestionGenerationBatch();
  const resume = useResumeQuestionGenerationBatch();
  const busy = pause.isPending || resume.isPending;
  const canCancel = CANCELLABLE_BATCH_STATUSES.includes(batch.status);
  if (!canCancel) return null;

  const run = (mutation: typeof pause, done: string, failed: "pauseError" | "resumeError"): void =>
    mutation.mutate(batch.publicId, {
      onSuccess: () => showToast(done, { tone: "success" }),
      onError: (error) => showToast(batchErrorMessage(error, messages, failed), { tone: "error" }),
    });
  const expiresAt = batch.status === "PAUSED" && batch.pauseExpiresAt
    ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "short", timeStyle: "short" })
        .format(new Date(batch.pauseExpiresAt))
    : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {PAUSABLE_BATCH_STATUSES.includes(batch.status) ? (
          <Button type="button" variant="secondary" isLoading={pause.isPending} disabled={busy}
            onClick={() => run(pause, messages.paused, "pauseError")}>
            {messages.pauseBatch}
          </Button>
        ) : null}
        {batch.status === "PAUSING" ? (
          <Button type="button" variant="secondary" disabled>
            {messages.pausingBatch}
          </Button>
        ) : null}
        {batch.status === "PAUSED" ? (
          <Button type="button" variant="primary" isLoading={resume.isPending} disabled={busy}
            onClick={() => run(resume, messages.resumed, "resumeError")}>
            {messages.resumeBatch}
          </Button>
        ) : null}
        <Button type="button" variant="danger" disabled={busy} onClick={onCancel}>
          {messages.cancelBatch}
        </Button>
      </div>
      <p className="text-xs text-[var(--ink-muted)]">
        {expiresAt ? messages.pauseExpiresAt.replace("{time}", expiresAt) : messages.pauseHint}
      </p>
    </div>
  );
};
