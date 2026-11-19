"use client";

import { useMemo, type ReactElement } from "react";
import type { QuestionGenerationTaskTypeResponse } from "@pte/api-client";
import { ConfirmDialog, LoadingState, Modal } from "@pte/ui";
import { useQuestionGenerationPresets, useQuestionGenerationQuota, useQuestionGenerationTaskTypes } from "../api";
import { useGenerationSelection } from "../hooks/useGenerationSelection";
import { useGenerationSubmit } from "../hooks/useGenerationSubmit";
import { useDialogMessages } from "../messages/useDialogMessages";
import {
  estimateSeconds,
  maxItemsPerBatch,
  quotaRemaining,
  selectionTotal,
  validateSelection,
} from "../utils/generationSelection";
import { GenerationDialogFooter } from "./_GenerationDialogFooter";
import { GenerationDialogNotices } from "./_GenerationDialogNotices";
import { GenerationDialogPresets } from "./_GenerationDialogPresets";
import { GenerationDialogSharedSettings } from "./_GenerationDialogSharedSettings";
import { GenerationDialogSkillGrid } from "./_GenerationDialogSkillGrid";
import { GenerationDialogSummary } from "./_GenerationDialogSummary";

export interface GenerationDialogProps {
  open: boolean;
  onClose: () => void;
  /** The editor's task type: pre-ticked with 1 question, and the only type that keeps the in-form preview. */
  currentTaskType?: string;
  /** The editor form has unsaved input: starting a batch (which leaves the page) asks first. */
  isEditorDirty?: boolean;
  /** A single preview job was accepted; the caller follows it (live page, then back into the form). */
  onSingleJobCreated: (jobId: string) => void;
}

/** Centered popup to generate any mix of task types; mounted fresh on every open. */
export const GenerationDialog = (props: GenerationDialogProps): ReactElement | null => {
  const { data: taskTypes } = useQuestionGenerationTaskTypes();
  const messages = useDialogMessages();
  if (!props.open) return null;
  if (taskTypes) return <GenerationDialogContent {...props} taskTypes={taskTypes} />;
  return (
    <Modal open onClose={props.onClose} title={messages.title} size="wide">
      <LoadingState rows={6} />
    </Modal>
  );
};

interface ContentProps extends GenerationDialogProps {
  taskTypes: readonly QuestionGenerationTaskTypeResponse[];
}

const GenerationDialogContent = ({ taskTypes, currentTaskType, isEditorDirty, onClose, onSingleJobCreated }: ContentProps): ReactElement => {
  const messages = useDialogMessages();
  const { data: quota } = useQuestionGenerationQuota();
  const { data: presets = [] } = useQuestionGenerationPresets();
  const current = taskTypes.find((type) => type.taskType === currentTaskType);
  const state = useGenerationSelection(current ? { taskType: current.taskType, section: current.section } : undefined);
  const submit = useGenerationSubmit({ selection: state.selection, currentTaskType, isEditorDirty, messages, onSingleJobCreated, onClose });
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
      size="wide"
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
      <div className="space-y-5">
        <GenerationDialogSharedSettings selection={state.selection} messages={messages} onChange={state.setShared} />
        <GenerationDialogPresets presets={presets} supported={supported} cap={cap} state={state} messages={messages} />
        <GenerationDialogSkillGrid taskTypes={taskTypes} state={state} messages={messages} />
        <GenerationDialogSummary
          typeCount={state.selection.rows.length}
          total={total}
          etaSeconds={estimateSeconds(state.selection, taskTypes)}
          mode={submit.mode}
          quota={quota}
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
