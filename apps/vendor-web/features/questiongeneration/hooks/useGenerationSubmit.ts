"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@pte/api-client";
import { useToast } from "@pte/ui";
import { useCreateQuestionGenerationBatch } from "../../batchgeneration/api";
import { batchDetailHref } from "../../batchgeneration/constants";
import { batchErrorMessage } from "../../batchgeneration/utils/batchError";
import { useBatchMessages } from "../../batchgeneration/messages/useBatchMessages";
import { useCreateQuestionGenerationJob } from "../api";
import {
  GENERATION_ALREADY_RUNNING_CODE,
  GENERATION_BATCH_DISABLED_CODE,
} from "../dialogConstants";
import { useGenerationMessages } from "../messages/useGenerationMessages";
import type { DialogMessages } from "../messages/dialog.en";
import { generationStartError } from "../utils/generationStartError";
import {
  resolveSubmitMode,
  toBatchRequest,
  toSingleJobRequest,
  type GenerationSelection,
  type SubmitMode,
} from "../utils/generationSelection";

/** Refusals the popup shows as a notice inside itself rather than as a toast. */
export type GenerationNotice = "batchDisabled" | "alreadyRunning";

export interface GenerationSubmitOptions {
  selection: GenerationSelection;
  currentTaskType?: string;
  isEditorDirty?: boolean;
  messages: DialogMessages;
  onSingleJobCreated: (jobId: string) => void;
  /** A batch was accepted: the caller may remember its selection for "Same as last time". */
  onBatchStarted?: (selection: GenerationSelection) => void;
  onClose: () => void;
}

export interface GenerationSubmitState {
  mode: SubmitMode;
  isSubmitting: boolean;
  notice: GenerationNotice | null;
  confirmLeaveOpen: boolean;
  submit: () => void;
  confirmLeave: () => void;
  cancelLeave: () => void;
}

export function generationNoticeFor(error: unknown): GenerationNotice | null {
  const code = error instanceof ApiError ? error.code : undefined;
  if (code === GENERATION_BATCH_DISABLED_CODE) return "batchDisabled";
  if (code === GENERATION_ALREADY_RUNNING_CODE) return "alreadyRunning";
  return null;
}

/** U1: one item of the editor's own type → the in-form preview job; anything else → a batch and its page. */
export function useGenerationSubmit(options: GenerationSubmitOptions): GenerationSubmitState {
  const {
    selection,
    currentTaskType,
    isEditorDirty = false,
    messages,
    onSingleJobCreated,
    onBatchStarted,
    onClose,
  } = options;
  const router = useRouter();
  const { showToast } = useToast();
  const startMessages = useGenerationMessages();
  const batchMessages = useBatchMessages();
  const createJob = useCreateQuestionGenerationJob();
  const createBatch = useCreateQuestionGenerationBatch();
  const [notice, setNotice] = useState<GenerationNotice | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const mode = resolveSubmitMode(selection, currentTaskType);

  const onFailure = (error: unknown, fallback: string): void => {
    const next = generationNoticeFor(error);
    setNotice(next);
    if (!next) showToast(fallback, { tone: "error" });
  };

  const startSingle = (): void => {
    createJob.mutate(toSingleJobRequest(selection), {
      onSuccess: (job) => onSingleJobCreated(job.publicId),
      onError: (error) => onFailure(error, generationStartError(error, startMessages)),
    });
  };

  const startBatch = (): void => {
    setConfirmLeaveOpen(false);
    createBatch.mutate(toBatchRequest(selection), {
      onSuccess: (batch) => {
        onBatchStarted?.(selection);
        showToast(messages.batchStarted);
        onClose();
        router.push(batchDetailHref(batch.publicId));
      },
      onError: (error) => onFailure(error, batchErrorMessage(error, batchMessages, "createError")),
    });
  };

  return {
    mode,
    isSubmitting: createJob.isPending || createBatch.isPending,
    notice,
    confirmLeaveOpen,
    submit: () => {
      setNotice(null);
      if (mode === "single") startSingle();
      else if (isEditorDirty) setConfirmLeaveOpen(true);
      else startBatch();
    },
    confirmLeave: startBatch,
    cancelLeave: () => setConfirmLeaveOpen(false),
  };
}
