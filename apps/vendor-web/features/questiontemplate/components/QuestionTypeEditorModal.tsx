"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Modal } from "@pte/ui";
import {
  getUserFacingApiErrorMessage,
  type CreateQuestionTypeRequest,
  type QuestionTypeResponse,
  type QuestionTypeSection,
  type SupportedQuestionTypeResponse,
  type UpdateQuestionTypeRequest,
} from "@pte/api-client";
import { useCreateQuestionType, useUpdateQuestionType } from "../api";
import { QUESTION_TYPE_SECTIONS, QUESTION_TYPE_TEXT } from "../constants";
import {
  QuestionTypeEditorFields,
  type EditorMode,
  type QuestionTypeFormDraft,
} from "./_QuestionTypeEditorFields";

interface QuestionTypeEditorModalProps {
  mode: EditorMode;
  editing: QuestionTypeResponse | null;
  questionTypes: QuestionTypeResponse[];
  supportedTypes: SupportedQuestionTypeResponse[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}
const toSection = (section: string): QuestionTypeSection =>
  QUESTION_TYPE_SECTIONS.includes(section as QuestionTypeSection)
    ? (section as QuestionTypeSection)
    : "SPEAKING";
const toDisplayName = (code: string): string =>
  code
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const toDraft = (type: QuestionTypeResponse): QuestionTypeFormDraft => ({
  code: type.code,
  section: toSection(type.section),
  displayName: type.displayName,
  shortName: type.shortName,
  displayOrder: type.displayOrder,
  active: type.active,
  requiresAudioPrompt: type.requiresAudioPrompt,
  requiresImagePrompt: type.requiresImagePrompt,
  requiresPromptText: type.requiresPromptText,
  requiresOptions: type.requiresOptions,
  requiresCorrectAnswer: type.requiresCorrectAnswer,
  requiresWordCount: type.requiresWordCount,
  requiresSingleCorrectOption: type.requiresSingleCorrectOption,
  usesOptionOrderAsCorrectPosition: type.usesOptionOrderAsCorrectPosition,
});

const newDraft = (displayOrder: number): QuestionTypeFormDraft => ({
  code: "",
  section: "SPEAKING",
  displayName: "",
  shortName: "",
  displayOrder,
  active: true,
  requiresAudioPrompt: false,
  requiresImagePrompt: false,
  requiresPromptText: false,
  requiresOptions: false,
  requiresCorrectAnswer: false,
  requiresWordCount: false,
  requiresSingleCorrectOption: false,
  usesOptionOrderAsCorrectPosition: false,
});

const errorMessage = (error: unknown, fallback: string): string =>
  getUserFacingApiErrorMessage(error, fallback);

export const QuestionTypeEditorModal = ({
  mode,
  editing,
  questionTypes,
  supportedTypes,
  onClose,
  onSuccess,
}: QuestionTypeEditorModalProps): ReactElement => {
  const createMutation = useCreateQuestionType();
  const updateMutation = useUpdateQuestionType();
  const [draft, setDraft] = useState<QuestionTypeFormDraft>(() =>
    mode === "create"
      ? newDraft(Math.max(0, ...questionTypes.map((type) => type.displayOrder)) + 1)
      : toDraft(editing as QuestionTypeResponse),
  );

  const updateCode = (code: string): void => {
    const task = supportedTypes.find((candidate) => candidate.code === code);
    setDraft((current) => ({
      ...current,
      code,
      displayName: task ? toDisplayName(code) : "",
      shortName: task ? code : "",
      section: task?.section ?? current.section,
    }));
  };

  const closeEditor = (): void => {
    if (createMutation.isPending || updateMutation.isPending) return;
    onClose();
  };

  const save = async (): Promise<void> => {
    try {
      if (mode === "create") {
        const payload: CreateQuestionTypeRequest = {
          code: draft.code,
          displayName: draft.displayName.trim(),
          shortName: draft.shortName.trim(),
          section: draft.section,
          displayOrder: draft.displayOrder,
          active: draft.active,
        };
        await createMutation.mutateAsync({ payload });
        onSuccess(QUESTION_TYPE_TEXT.CREATE_SUCCESS);
      } else if (editing) {
        const payload: UpdateQuestionTypeRequest = {
          displayName: draft.displayName.trim(),
          shortName: draft.shortName.trim(),
          displayOrder: draft.displayOrder,
          active: draft.active,
          requiresAudioPrompt: draft.requiresAudioPrompt,
          requiresImagePrompt: draft.requiresImagePrompt,
          requiresPromptText: draft.requiresPromptText,
          requiresOptions: draft.requiresOptions,
          requiresCorrectAnswer: draft.requiresCorrectAnswer,
          requiresWordCount: draft.requiresWordCount,
          requiresSingleCorrectOption: draft.requiresSingleCorrectOption,
          usesOptionOrderAsCorrectPosition: draft.usesOptionOrderAsCorrectPosition,
        };
        await updateMutation.mutateAsync({ publicId: editing.publicId, payload });
        onSuccess(QUESTION_TYPE_TEXT.UPDATE_SUCCESS);
      }
    } catch {
      // The mutation error is rendered in the modal below.
    }
  };

  const existingCodes = new Set(questionTypes.map((type) => type.code));
  const createOptions = supportedTypes
    .filter((type) => !existingCodes.has(type.code))
    .map((type) => ({ label: type.code, value: type.code }));
  const selectedTask = supportedTypes.find((type) => type.code === draft.code);
  const sectionOptions = QUESTION_TYPE_SECTIONS.map((section) => ({
    label: section,
    value: section,
    disabled: Boolean(selectedTask && selectedTask.section !== section),
  }));
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canSave = Boolean(
    draft.code && draft.displayName.trim() && draft.shortName.trim() && draft.section,
  );
  const mutationError = createMutation.isError ? createMutation.error : updateMutation.error;
  const hasMutationError = createMutation.isError || updateMutation.isError;
  const handleDraftChange = (
    key: keyof QuestionTypeFormDraft,
    value: QuestionTypeFormDraft[keyof QuestionTypeFormDraft],
  ): void => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <Modal
      open
      onClose={closeEditor}
      title={
        mode === "create"
          ? QUESTION_TYPE_TEXT.CREATE_TITLE
          : `${QUESTION_TYPE_TEXT.EDIT_TITLE}: ${editing?.code ?? ""}`
      }
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={closeEditor} disabled={isSaving}>
            {QUESTION_TYPE_TEXT.CANCEL}
          </Button>
          <Button
            variant="primary"
            onClick={() => void save()}
            isLoading={isSaving}
            disabled={!canSave}
          >
            {mode === "create" ? QUESTION_TYPE_TEXT.CREATE : QUESTION_TYPE_TEXT.SAVE}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {hasMutationError && (
          <Alert tone="error">
            {errorMessage(
              mutationError,
              mode === "create" ? QUESTION_TYPE_TEXT.CREATE_ERROR : QUESTION_TYPE_TEXT.SAVE_ERROR,
            )}
          </Alert>
        )}
        <QuestionTypeEditorFields
          mode={mode}
          draft={draft}
          createOptions={createOptions}
          selectedTask={selectedTask}
          sectionOptions={sectionOptions}
          onCodeChange={updateCode}
          onChange={handleDraftChange}
        />
      </div>
    </Modal>
  );
};
