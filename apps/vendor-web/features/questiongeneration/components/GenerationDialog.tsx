"use client";

import { useMemo, type ReactElement } from "react";
import type { QuestionGenerationTaskTypeResponse } from "@pte/api-client";
import { ConfirmDialog, LoadingState, Modal } from "@pte/ui";
import {
  useQuestionGenerationCefrMix,
  useQuestionGenerationPresets,
  useQuestionGenerationQuota,
  useQuestionGenerationTaskTypes,
} from "../api";
import { useGenerationSelection } from "../hooks/useGenerationSelection";
import { useGenerationSubmit } from "../hooks/useGenerationSubmit";
import { useLastGenerationSelection } from "../hooks/useLastGenerationSelection";
import { useDialogMessages } from "../messages/useDialogMessages";
import { mixShares } from "../utils/generationMix";
import {
  estimateSeconds,
  maxItemsPerBatch,
  quotaRemaining,
  selectionTotal,
  validateSelection,
} from "../utils/generationSelection";
import { GenerationDialogFooter } from "./_GenerationDialogFooter";
import { GenerationDialogNotices } from "./_GenerationDialogNotices";
import { GenerationMatrix } from "./_GenerationMatrix";
import { GenerationMatrixToolbar } from "./_GenerationMatrixToolbar";
import { GenerationSidebar } from "./_GenerationSidebar";

export interface GenerationDialogProps {
  open: boolean;
  onClose: () => void;
  /** The editor's task type: pre-filled with 1 question, and the only type that keeps the in-form preview. */
  currentTaskType?: string;
  /** The editor form has unsaved input: starting a batch (which leaves the page) asks first. */
  isEditorDirty?: boolean;
  /** A single preview job was accepted; the caller follows it (live page, then back into the form). */
  onSingleJobCreated: (jobId: string) => void;
}

/** Centered popup to generate any mix of task types and levels; mounted fresh on every open. */
export const GenerationDialog = (props: GenerationDialogProps): ReactElement | null => {
  const { data: taskTypes } = useQuestionGenerationTaskTypes();
  const messages = useDialogMessages();
  if (!props.open) return null;
  if (taskTypes) return <GenerationDialogContent {...props} taskTypes={taskTypes} />;
  return (
    <Modal open onClose={props.onClose} title={messages.title} size="extraWide">
      <LoadingState rows={6} />
    </Modal>
  );
};

interface ContentProps extends GenerationDialogProps {
  taskTypes: readonly QuestionGenerationTaskTypeResponse[];
}

const GenerationDialogContent = ({
  taskTypes,
  currentTaskType,
  isEditorDirty,
  onClose,
  onSingleJobCreated,
}: ContentProps): ReactElement => {
  const messages = useDialogMessages();
  const { data: quota } = useQuestionGenerationQuota();
  const { data: presets = [] } = useQuestionGenerationPresets();
  const { data: mix = null } = useQuestionGenerationCefrMix();
  const shares = useMemo(() => mixShares(mix), [mix]);
  const lastSelection = useLastGenerationSelection();
  const current = taskTypes.find((type) => type.taskType === currentTaskType);
  const state = useGenerationSelection(
    current ? { taskType: current.taskType, section: current.section } : undefined,
  );
  const submit = useGenerationSubmit({
    selection: state.selection,
    currentTaskType,
    isEditorDirty,
    messages,
    onSingleJobCreated,
    onBatchStarted: lastSelection.remember,
    onClose,
  });
  const supported = useMemo(() => new Set(taskTypes.map((type) => type.taskType)), [taskTypes]);
  const cap = maxItemsPerBatch(quota);
  const total = selectionTotal(state.selection);
  const problem = validateSelection(state.selection, quota);
  const batchBlocked = submit.mode === "batch" && submit.notice === "batchDisabled";

  return (
    <Modal
      open
      onClose={onClose}
      title={messages.title}
      size="extraWide"
      stickyFooter
      isDismissDisabled={submit.isSubmitting}
      footer={
        <GenerationDialogFooter
          mode={submit.mode}
          total={total}
          canSubmit={problem === null && !batchBlocked}
          isSubmitting={submit.isSubmitting}
          messages={messages}
          onCancel={onClose}
          onSubmit={submit.submit}
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <GenerationMatrixToolbar
            taskTypes={taskTypes}
            presets={presets}
            shares={shares}
            supported={supported}
            cap={cap}
            last={lastSelection.last}
            state={state}
            messages={messages}
          />
          {total === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">{messages.matrixEmptyHint}</p>
          ) : null}
          <GenerationMatrix taskTypes={taskTypes} state={state} messages={messages} />
        </div>
        <div className="space-y-4 lg:sticky lg:top-0 lg:self-start lg:border-l lg:border-[var(--shell-border)] lg:pl-6">
          <GenerationSidebar
            state={state}
            total={total}
            etaSeconds={estimateSeconds(state.selection, taskTypes)}
            quota={quota}
            presets={presets}
            mix={mix}
            shares={shares}
            cap={cap}
            messages={messages}
          />
          <GenerationDialogNotices
            notice={submit.notice}
            problem={problem}
            cap={cap}
            remaining={quotaRemaining(quota)}
            messages={messages}
          />
        </div>
      </div>
      <ConfirmDialog
        open={submit.confirmLeaveOpen}
        title={messages.leaveTitle}
        description={messages.leaveDescription}
        confirmLabel={messages.leaveConfirm}
        cancelLabel={messages.leaveCancel}
        tone="warning"
        isConfirming={submit.isSubmitting}
        onConfirm={submit.confirmLeave}
        onClose={submit.cancelLeave}
      />
    </Modal>
  );
};
