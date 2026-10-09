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
import { useCreateTaskType, useTaskTypeAvailability, useUpdateTaskType } from "../api";
import {
  QUESTION_TYPE_SECTIONS,
  QUESTION_TYPE_EDITOR_TEXT as RAW_QUESTION_TYPE_EDITOR_TEXT,
  QUESTION_TYPE_TEXT as RAW_QUESTION_TYPE_TEXT,
} from "../constants";
import { getQuestionTypeErrorMessage } from "../errorMessage";
import {
  QuestionTypeEditorFields,
  type EditorMode,
  type QuestionTypeFormDraft,
} from "./_QuestionTypeEditorFields";
import { useAdminCopy } from "@/features/i18n/adminCopy";

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
  const T = useAdminCopy(RAW_QUESTION_TYPE_TEXT);
  const E = useAdminCopy(RAW_QUESTION_TYPE_EDITOR_TEXT);
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
        onSuccess(T.CREATE_SUCCESS);
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
        onSuccess(T.UPDATE_SUCCESS);
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
  const sectionOptions = useAdminCopy(
    QUESTION_TYPE_SECTIONS.map((section) => ({
      label: (
        {
          SPEAKING: "Speaking",
          WRITING: "Writing",
          READING: "Reading",
          LISTENING: "Listening",
        } as const
      )[section],
      value: section,
    })),
  );

  return (
    <Modal
      open
      onClose={closeEditor}
      title={
        mode === "create"
          ? T.CREATE_TITLE
          : `${T.EDIT_TITLE}: ${editing?.taskTypeKey ?? editing?.code ?? ""}`
      }
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={closeEditor} disabled={isSaving}>
            {T.CANCEL}
          </Button>
          <Button
            variant="primary"
            onClick={() => void save()}
            isLoading={isSaving}
            disabled={!canSave}
          >
            {mode === "create" ? T.CREATE : T.SAVE}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert tone="info">
          {mode === "create"
            ? E.CREATE_NOTICE
            : runtimeLocked
              ? E.RUNTIME_LOCKED_NOTICE
              : E.EDIT_NOTICE}
        </Alert>
        {invalidKey && draft.taskTypeKey.length > 0 && (
          <Alert tone="warning">{E.INVALID_KEY_FORMAT}</Alert>
        )}
        {availabilityKeyConflict && <Alert tone="warning">{E.KEY_ALREADY_USED}</Alert>}
        {availabilityNameConflict && <Alert tone="warning">{E.DISPLAY_NAME_ALREADY_USED}</Alert>}
        {hasMutationError && (
          <Alert tone="error">
            {getQuestionTypeErrorMessage(
              mutationError,
              mode === "create" ? T.CREATE_ERROR : T.SAVE_ERROR,
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
