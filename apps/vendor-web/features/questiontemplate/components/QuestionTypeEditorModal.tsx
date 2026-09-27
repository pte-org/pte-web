"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Modal } from "@pte/ui";
import type {
  CreateTaskTypeRequest,
  QuestionTypeResponse,
  QuestionTypeSection,
  TaskTypeCapabilityResponse,
  UpdateTaskTypeRequest,
} from "@pte/api-client";
import {
  useCreateTaskType,
  useTaskTypeAvailability,
  useUpdateTaskType,
} from "../api";
import { QUESTION_TYPE_SECTIONS, QUESTION_TYPE_EDITOR_TEXT, QUESTION_TYPE_TEXT } from "../constants";
import { getQuestionTypeErrorMessage } from "../errorMessage";
import {
  QuestionTypeEditorFields,
  type EditorMode,
  type QuestionTypeFormDraft,
} from "./_QuestionTypeEditorFields";

interface QuestionTypeEditorModalProps {
  mode: EditorMode;
  editing: QuestionTypeResponse | null;
  questionTypes: QuestionTypeResponse[];
  capabilities: TaskTypeCapabilityResponse[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const toSection = (section: string): QuestionTypeSection =>
  QUESTION_TYPE_SECTIONS.includes(section as QuestionTypeSection)
    ? (section as QuestionTypeSection)
    : "SPEAKING";

const toDraft = (type: QuestionTypeResponse): QuestionTypeFormDraft => ({
  taskTypeKey: type.taskTypeKey ?? type.code,
  section: toSection(type.section),
  displayName: type.displayName,
  shortName: type.shortName,
  screenKey: type.screenKey ?? type.runtime?.screenKey ?? "",
  contractVersion: type.contractVersion ?? type.runtime?.contractVersion ?? 0,
  displayOrder: type.displayOrder,
  active: type.active,
});

const newDraft = (displayOrder: number): QuestionTypeFormDraft => ({
  taskTypeKey: "",
  section: "SPEAKING",
  displayName: "",
  shortName: "",
  screenKey: "",
  contractVersion: 0,
  displayOrder,
  active: true,
});

const KEY_PATTERN = /^[A-Z][A-Z0-9_]{1,63}$/;

export const QuestionTypeEditorModal = ({
  mode,
  editing,
  questionTypes,
  capabilities,
  onClose,
  onSuccess,
}: QuestionTypeEditorModalProps): ReactElement => {
  const createMutation = useCreateTaskType();
  const updateMutation = useUpdateTaskType();
  const [draft, setDraft] = useState<QuestionTypeFormDraft>(() =>
    mode === "create"
      ? newDraft(Math.max(0, ...questionTypes.map((type) => type.displayOrder)) + 1)
      : toDraft(editing as QuestionTypeResponse),
  );
  const runtimeLocked = mode === "edit" && editing?.editability?.runtimeFields === false;
  const availability = useTaskTypeAvailability({
    taskTypeKey: draft.taskTypeKey,
    displayName: draft.displayName,
    excludePublicId: editing?.publicId,
  });

  const closeEditor = (): void => {
    if (createMutation.isPending || updateMutation.isPending) return;
    onClose();
  };

  const handleDraftChange = (
    key: keyof QuestionTypeFormDraft,
    value: QuestionTypeFormDraft[keyof QuestionTypeFormDraft],
  ): void => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const save = async (): Promise<void> => {
    try {
      if (mode === "create") {
        const payload: CreateTaskTypeRequest = {
          taskTypeKey: draft.taskTypeKey,
          displayName: draft.displayName.trim(),
          shortName: draft.shortName.trim(),
          section: draft.section,
          screenKey: draft.screenKey,
          contractVersion: draft.contractVersion,
          displayOrder: draft.displayOrder,
          active: draft.active,
        };
        await createMutation.mutateAsync({ payload });
        onSuccess(QUESTION_TYPE_TEXT.CREATE_SUCCESS);
      } else if (editing) {
        const payload: UpdateTaskTypeRequest = {
          displayName: draft.displayName.trim(),
          shortName: draft.shortName.trim(),
          displayOrder: draft.displayOrder,
          active: draft.active,
          ...(runtimeLocked
            ? {}
            : {
                screenKey: draft.screenKey,
                contractVersion: draft.contractVersion,
                section: draft.section,
              }),
        };
        await updateMutation.mutateAsync({ publicId: editing.publicId, payload });
        onSuccess(QUESTION_TYPE_TEXT.UPDATE_SUCCESS);
      }
    } catch {
      // The mutation error is rendered in the modal below.
    }
  };

  const availabilityKeyConflict = availability.data?.taskTypeKey.available === false;
  const availabilityNameConflict = availability.data?.displayName.available === false;
  const invalidKey = mode === "create" && !KEY_PATTERN.test(draft.taskTypeKey);
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.isError ? createMutation.error : updateMutation.error;
  const hasMutationError = createMutation.isError || updateMutation.isError;
  const canSave = Boolean(
    draft.taskTypeKey &&
      !invalidKey &&
      !availabilityKeyConflict &&
      !availabilityNameConflict &&
      draft.displayName.trim() &&
      draft.shortName.trim() &&
      draft.section &&
      draft.screenKey &&
      draft.contractVersion > 0,
  );
  const sectionOptions = QUESTION_TYPE_SECTIONS.map((section) => ({
    label: section,
    value: section,
  }));

  return (
    <Modal
      open
      onClose={closeEditor}
      title={
        mode === "create"
          ? QUESTION_TYPE_TEXT.CREATE_TITLE
          : `${QUESTION_TYPE_TEXT.EDIT_TITLE}: ${editing?.taskTypeKey ?? editing?.code ?? ""}`
      }
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={closeEditor} disabled={isSaving}>
            {QUESTION_TYPE_TEXT.CANCEL}
          </Button>
          <Button variant="primary" onClick={() => void save()} isLoading={isSaving} disabled={!canSave}>
            {mode === "create" ? QUESTION_TYPE_TEXT.CREATE : QUESTION_TYPE_TEXT.SAVE}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert tone="info">
          {mode === "create"
            ? QUESTION_TYPE_EDITOR_TEXT.CREATE_NOTICE
            : runtimeLocked
              ? QUESTION_TYPE_EDITOR_TEXT.RUNTIME_LOCKED_NOTICE
              : QUESTION_TYPE_EDITOR_TEXT.EDIT_NOTICE}
        </Alert>
        {invalidKey && draft.taskTypeKey.length > 0 && (
          <Alert tone="warning">{QUESTION_TYPE_EDITOR_TEXT.INVALID_KEY_FORMAT}</Alert>
        )}
        {availabilityKeyConflict && (
          <Alert tone="warning">{QUESTION_TYPE_EDITOR_TEXT.KEY_ALREADY_USED}</Alert>
        )}
        {availabilityNameConflict && (
          <Alert tone="warning">{QUESTION_TYPE_EDITOR_TEXT.DISPLAY_NAME_ALREADY_USED}</Alert>
        )}
        {hasMutationError && (
          <Alert tone="error">
            {getQuestionTypeErrorMessage(
              mutationError,
              mode === "create" ? QUESTION_TYPE_TEXT.CREATE_ERROR : QUESTION_TYPE_TEXT.SAVE_ERROR,
            )}
          </Alert>
        )}
        <QuestionTypeEditorFields
          mode={mode}
          draft={draft}
          capabilities={capabilities}
          sectionOptions={sectionOptions}
          runtimeLocked={runtimeLocked}
          onChange={handleDraftChange}
        />
      </div>
    </Modal>
  );
};
