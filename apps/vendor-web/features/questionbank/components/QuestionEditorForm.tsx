"use client";

import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Select, useToast } from "@pte/ui";
import {
  completeCloudinaryUpload,
  getUserFacingApiErrorMessage,
  requestCloudinaryUpload,
  type CefrLevel,
  type CreateQuestionRequest,
  type QuestionPool,
  type QuestionResponse,
  type UpdateQuestionRequest,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { useCreateQuestion, useCreateQuestionRevision, useUpdateQuestion } from "../api";
import { usePromptMediaUrl } from "../hooks/usePromptMediaUrl";
import { poolToAvailability, resolveCurrentPool } from "../poolAvailability";
import { MediaFileField } from "./_MediaFileField";
import { PoolChangeDialog } from "./_PoolChangeDialog";
import {
  CEFR_LEVELS,
  QUESTION_EDITOR_ERRORS as RAW_QUESTION_EDITOR_ERRORS,
  QUESTION_EDITOR_TEXT as RAW_QUESTION_EDITOR_TEXT,
  QUESTION_POOL_LABELS,
} from "../constants";
import type { QuestionPreviewDraft } from "../types";

interface DraftOption {
  text: string;
  correct: boolean;
  orderIndex: number;
  blankIndex?: number | null;
  correctGapIndex?: number | null;
}

interface QuestionEditorFormProps {
  question?: QuestionResponse;
  onSaved?: (question: QuestionResponse) => void;
  onCancel?: () => void;
  /** Called with what the form holds each time it changes, for a live preview next to it. */
  onPreviewChange?: (preview: QuestionPreviewDraft) => void;
  /**
   * The question is published, so saving first opens a draft revision of it and puts the edits
   * there. Nothing is created on the server until the writer saves.
   */
  saveAsRevision?: boolean;
  /** Limits the task type dropdown to one exam section; omit to list every task type. */
  sectionFilter?: string;
}

const fieldClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export const QuestionEditorForm = ({
  question,
  onSaved,
  onCancel,
  onPreviewChange,
  saveAsRevision = false,
  sectionFilter,
}: QuestionEditorFormProps): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const E = useAdminCopy(RAW_QUESTION_EDITOR_ERRORS);
  const poolLabels = useAdminCopy(QUESTION_POOL_LABELS);
  const poolOptions: { value: QuestionPool; label: string }[] = [
    { value: "EXAM", label: poolLabels.exam },
    { value: "PRACTICE", label: poolLabels.practice },
  ];
  const createMutation = useCreateQuestion();
  const revisionMutation = useCreateQuestionRevision();
  const updateMutation = useUpdateQuestion();
  const { showToast } = useToast();
  const {
    data: questionTypes = [],
    isLoading: questionTypesLoading,
    isError: questionTypesError,
  } = useQuestionTypes(!question);
  const [taskType, setTaskType] = useState<string>(question?.pteTaskType ?? "");
  const initialPool: QuestionPool = question ? resolveCurrentPool(question) : "EXAM";
  const [pool, setPool] = useState<QuestionPool>(initialPool);
  const [cefrLevel, setCefrLevel] = useState<string>(question?.cefrLevel ?? "");
  const [pendingUpdate, setPendingUpdate] = useState<UpdateQuestionRequest | null>(null);
  const isPoolEditable = !question || question.status === "DRAFT";
  const [promptText, setPromptText] = useState(question?.promptText ?? "");
  const [referenceAnswerText, setReferenceAnswerText] = useState(
    question?.referenceAnswerText ?? "",
  );
  const [correctAnswerText, setCorrectAnswerText] = useState(question?.correctAnswerText ?? "");
  const [minWordCount, setMinWordCount] = useState(question?.minWordCount?.toString() ?? "");
  const [maxWordCount, setMaxWordCount] = useState(question?.maxWordCount?.toString() ?? "");
  const [audioPromptRef, setAudioPromptRef] = useState<string | null>(
    question?.audioPromptRef ?? null,
  );
  const [imagePromptRef, setImagePromptRef] = useState<string | null>(
    question?.imagePromptRef ?? null,
  );
  const audioUrl = usePromptMediaUrl(audioPromptRef);
  const imageUrl = usePromptMediaUrl(imagePromptRef);
  const [options, setOptions] = useState<DraftOption[]>(
    () =>
      question?.options.map((option) => ({
        text: option.text,
        correct: option.correct,
        orderIndex: option.orderIndex,
        blankIndex: option.blankIndex,
        correctGapIndex: option.correctGapIndex,
      })) ?? [
        { text: "", correct: true, orderIndex: 0 },
        { text: "", correct: false, orderIndex: 1 },
      ],
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<"AUDIO_PROMPT" | "IMAGE_PROMPT" | null>(null);
  const isPending =
    createMutation.isPending || updateMutation.isPending || revisionMutation.isPending;
  const listedTypes = sectionFilter
    ? questionTypes.filter((type) => type.section === sectionFilter)
    : questionTypes;
  // A type outside the chosen section is replaced by that section's first one.
  const selectedTaskType =
    (listedTypes.some((type) => type.code === taskType) ? taskType : listedTypes[0]?.code) ||
    taskType ||
    questionTypes[0]?.code ||
    "";
  const questionType = questionTypes.find((type) => type.code === selectedTaskType);
  const hasOptions = questionType?.requiresOptions ?? false;

  useEffect(() => {
    onPreviewChange?.({
      taskType: selectedTaskType,
      taskName: questionType?.displayName ?? selectedTaskType,
      section: questionType?.section ?? "",
      instruction: questionType?.instruction ?? null,
      promptText,
      options: hasOptions ? options.map((option) => option.text) : [],
      multipleChoice: hasOptions && !questionType?.requiresSingleCorrectOption,
      needsWordCount: questionType?.requiresWordCount ?? false,
      minWordCount: minWordCount ? Number(minWordCount) : null,
      maxWordCount: maxWordCount ? Number(maxWordCount) : null,
      expectsImage: questionType?.requiresImagePrompt ?? false,
      expectsAudio: questionType?.requiresAudioPrompt ?? false,
      imageUrl,
      audioUrl,
    });
  }, [
    onPreviewChange,
    selectedTaskType,
    questionType,
    promptText,
    options,
    hasOptions,
    minWordCount,
    maxWordCount,
    imageUrl,
    audioUrl,
  ]);

  const uploadMedia = async (file: File, kind: "AUDIO_PROMPT" | "IMAGE_PROMPT") => {
    setError(null);
    setUploadingKind(kind);
    try {
      const signed = await requestCloudinaryUpload(apiClient, {
        contentType: file.type,
        assetKind: kind,
        sizeBytes: file.size,
      });
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signed.apiKey);
      body.append("timestamp", signed.timestamp);
      body.append("signature", signed.signature);
      body.append("folder", signed.folder);
      body.append("public_id", signed.mediaPublicId);
      const response = await fetch(signed.uploadUrl, { method: "POST", body });
      if (!response.ok) throw new Error(E.CLOUDINARY_UPLOAD);
      const uploaded = (await response.json()) as {
        public_id: string;
        asset_id: string;
        secure_url: string;
        resource_type: string;
        format?: string;
        bytes?: number;
        duration?: number;
        version?: number;
        signature?: string;
      };
      await completeCloudinaryUpload(apiClient, signed.mediaPublicId, {
        publicId: uploaded.public_id,
        assetId: uploaded.asset_id,
        secureUrl: uploaded.secure_url,
        resourceType: uploaded.resource_type,
        format: uploaded.format,
        bytes: uploaded.bytes,
        durationSeconds: uploaded.duration,
        version: uploaded.version,
        signature: uploaded.signature,
      });
      if (kind === "AUDIO_PROMPT") setAudioPromptRef(signed.mediaPublicId);
      else setImagePromptRef(signed.mediaPublicId);
    } catch (uploadError) {
      setError(getUserFacingApiErrorMessage(uploadError, E.MEDIA_UPLOAD));
    } finally {
      setUploadingKind(null);
    }
  };

  const saveUpdate = (payload: UpdateQuestionRequest): void => {
    if (!question) return;
    const saveInto = (target: QuestionResponse, body: UpdateQuestionRequest): void =>
      updateMutation.mutate(
        { id: target.publicId, payload: body },
        {
          onSuccess: (saved) => {
            setPendingUpdate(null);
            showToast(T.UPDATE_SUCCESS);
            onSaved?.(saved);
          },
          onError: () => setPendingUpdate(null),
        },
      );
    if (!saveAsRevision) return saveInto(question, payload);
    revisionMutation.mutate(question.publicId, {
      onSuccess: (revision) => saveInto(revision, { ...payload, version: revision.version ?? 0 }),
      onError: () => setPendingUpdate(null),
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!questionType) return setError(E.QUESTION_TYPES_UNAVAILABLE);
    if (questionType.requiresPromptText && !promptText.trim()) return setError(E.PROMPT_REQUIRED);
    if (questionType.requiresAudioPrompt && !audioPromptRef) return setError(E.AUDIO_REQUIRED);
    if (questionType.requiresImagePrompt && !imagePromptRef) return setError(E.IMAGE_REQUIRED);
    if (questionType.requiresWordCount && (!minWordCount || !maxWordCount))
      return setError(E.WORD_COUNTS_REQUIRED);
    if (questionType.requiresCorrectAnswer && !hasOptions && !correctAnswerText.trim())
      return setError(E.CORRECT_ANSWER_REQUIRED);
    if (questionType.requiresReferenceAnswer && !referenceAnswerText.trim())
      return setError(E.REFERENCE_ANSWER_REQUIRED);
    if (hasOptions && (options.length === 0 || options.some((option) => !option.text.trim()))) {
      return setError(E.OPTION_TEXT_REQUIRED);
    }
    if (
      hasOptions &&
      questionType.requiresCorrectAnswer &&
      options.every((option) => !option.correct)
    ) {
      return setError(E.CORRECT_OPTION_REQUIRED);
    }
    if (
      questionType.requiresSingleCorrectOption &&
      options.filter((option) => option.correct).length !== 1
    ) {
      return setError(E.SINGLE_CORRECT_REQUIRED);
    }
    const content = {
      promptText: promptText || null,
      audioPromptRef,
      imagePromptRef,
      referenceAnswerText: referenceAnswerText || null,
      correctAnswerText: correctAnswerText || null,
      minWordCount: minWordCount ? Number(minWordCount) : null,
      maxWordCount: maxWordCount ? Number(maxWordCount) : null,
      options: hasOptions ? options : [],
      cefrLevel: cefrLevel ? (cefrLevel as CefrLevel) : null,
    };
    if (question) {
      const poolChanged = pool !== initialPool;
      const payload: UpdateQuestionRequest = {
        ...content,
        version: question.version,
        ...(poolChanged ? poolToAvailability(pool) : {}),
      };
      if (poolChanged) setPendingUpdate(payload);
      else saveUpdate(payload);
    } else {
      const payload: CreateQuestionRequest = { pteTaskType: selectedTaskType, pool, ...content };
      createMutation.mutate(payload, {
        onSuccess: (saved) => {
          showToast(T.CREATE_SUCCESS);
          onSaved?.(saved);
        },
      });
    }
  };

  const updateOption = (index: number, patch: Partial<DraftOption>): void => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    );
  };

  const poolHelperText = !question
    ? T.POOL_HELPER_CREATE
    : isPoolEditable
      ? T.POOL_HELPER_EDIT
      : T.POOL_HELPER_LOCKED;

  return (
    <form className="flex max-w-4xl flex-col gap-4" onSubmit={submit}>
      <h2 className="text-xl font-semibold text-gray-900">
        {question ? T.FORM_EDIT_TITLE : T.FORM_CREATE_TITLE}
      </h2>
      {error && <Alert tone="error">{error}</Alert>}
      {questionTypesError && <Alert tone="error">{E.LOAD_TYPES}</Alert>}
      {revisionMutation.isError && <Alert tone="error">{E.CREATE_REVISION}</Alert>}
      {(createMutation.isError || updateMutation.isError) && <Alert tone="error">{E.SAVE}</Alert>}
      <Select
        id="question-task-type"
        label={T.TASK_TYPE}
        value={selectedTaskType}
        disabled={Boolean(question) || questionTypesLoading}
        onChange={(event) => setTaskType(event.target.value)}
        placeholder={!taskType ? T.LOADING_TASK_TYPES : undefined}
        options={[
          ...listedTypes.map((type) => ({
            value: type.code,
            label: `${type.displayName} (${type.shortName})`,
          })),
          ...(selectedTaskType && !listedTypes.some((type) => type.code === selectedTaskType)
            ? [{ value: selectedTaskType, label: selectedTaskType }]
            : []),
        ]}
      />
      <Select
        id="question-pool"
        label={T.POOL}
        value={pool}
        disabled={!isPoolEditable}
        onChange={(event) => setPool(event.target.value as QuestionPool)}
        options={poolOptions}
        helperText={poolHelperText}
      />
      <Select
        id="question-cefr-level"
        label={T.CEFR_LEVEL}
        value={cefrLevel}
        disabled={!isPoolEditable}
        onChange={(event) => setCefrLevel(event.target.value)}
        options={[
          { value: "", label: T.CEFR_UNSET },
          ...CEFR_LEVELS.map((level) => ({ value: level, label: level })),
        ]}
        helperText={T.CEFR_HELPER}
      />
      <label className="text-sm font-medium text-gray-700">
        {T.PROMPT_TEXT}
        <textarea
          className={`${fieldClass} mt-1 min-h-28`}
          value={promptText}
          onChange={(event) => setPromptText(event.target.value)}
        />
      </label>
      {questionType?.requiresAudioPrompt && (
        <MediaFileField
          id="question-audio-prompt"
          label={T.AUDIO_PROMPT}
          accept="audio/wav,audio/mpeg"
          uploadedLabel={audioPromptRef ? T.UPLOADED_MEDIA(audioPromptRef) : null}
          isUploading={uploadingKind === "AUDIO_PROMPT"}
          chooseLabel={T.CHOOSE_FILE}
          replaceLabel={T.REPLACE_FILE}
          noFileLabel={T.NO_FILE}
          uploadingLabel={T.UPLOADING}
          onSelect={(file) => void uploadMedia(file, "AUDIO_PROMPT")}
        />
      )}
      {questionType?.requiresImagePrompt && (
        <MediaFileField
          id="question-image-prompt"
          label={T.IMAGE_PROMPT}
          accept="image/png,image/jpeg,image/webp"
          uploadedLabel={imagePromptRef ? T.UPLOADED_MEDIA(imagePromptRef) : null}
          isUploading={uploadingKind === "IMAGE_PROMPT"}
          chooseLabel={T.CHOOSE_FILE}
          replaceLabel={T.REPLACE_FILE}
          noFileLabel={T.NO_FILE}
          uploadingLabel={T.UPLOADING}
          onSelect={(file) => void uploadMedia(file, "IMAGE_PROMPT")}
        />
      )}
      {questionType?.requiresWordCount && (
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={T.MIN_WORD_COUNT}
            type="number"
            value={minWordCount}
            onChange={(event) => setMinWordCount(event.target.value)}
          />
          <Input
            label={T.MAX_WORD_COUNT}
            type="number"
            value={maxWordCount}
            onChange={(event) => setMaxWordCount(event.target.value)}
          />
        </div>
      )}
      <Input
        label={T.REFERENCE_ANSWER}
        value={referenceAnswerText}
        onChange={(event) => setReferenceAnswerText(event.target.value)}
      />
      {(!hasOptions || questionType?.requiresCorrectAnswer) && (
        <Input
          label={T.CORRECT_ANSWER}
          value={correctAnswerText}
          onChange={(event) => setCorrectAnswerText(event.target.value)}
        />
      )}
      {hasOptions && (
        <fieldset className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-gray-700">{T.OPTIONS}</legend>
          {options.map((option, index) => (
            <div className="flex items-center gap-2" key={index}>
              <input
                type="checkbox"
                checked={option.correct}
                onChange={(event) => updateOption(index, { correct: event.target.checked })}
                aria-label={T.CORRECT_OPTION(index + 1)}
              />
              <Input
                value={option.text}
                placeholder={T.OPTION(index + 1)}
                onChange={(event) => updateOption(index, { text: event.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))
                }
              >
                {T.REMOVE}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setOptions((current) => [
                ...current,
                { text: "", correct: false, orderIndex: current.length },
              ])
            }
          >
            {T.ADD_OPTION}
          </Button>
        </fieldset>
      )}
      <div className="flex flex-wrap gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
            {T.CANCEL}
          </Button>
        )}
        <Button type="submit" isLoading={isPending}>
          {question ? T.SAVE_DRAFT : T.CREATE_DRAFT}
        </Button>
      </div>
      <PoolChangeDialog
        open={pendingUpdate !== null}
        targetPool={pool}
        previouslyPublished={question?.previouslyPublished === true}
        isConfirming={updateMutation.isPending}
        onConfirm={() => pendingUpdate && saveUpdate(pendingUpdate)}
        onClose={() => setPendingUpdate(null)}
      />
    </form>
  );
};
