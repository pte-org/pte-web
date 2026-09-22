"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input } from "@pte/ui";
import {
  completeCloudinaryUpload,
  getUserFacingApiErrorMessage,
  requestCloudinaryUpload,
  type CreateQuestionRequest,
  type QuestionResponse,
  type UpdateQuestionRequest,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { useCreateQuestion, useUpdateQuestion } from "../api";
import { QUESTION_EDITOR_ERRORS as E, QUESTION_EDITOR_TEXT as T } from "../constants";

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
}

const fieldClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export const QuestionEditorForm = ({
  question,
  onSaved,
  onCancel,
}: QuestionEditorFormProps): ReactElement => {
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const {
    data: questionTypes = [],
    isLoading: questionTypesLoading,
    isError: questionTypesError,
  } = useQuestionTypes(!question);
  const [taskType, setTaskType] = useState<string>(question?.pteTaskType ?? "");
  const [title, setTitle] = useState(question?.title ?? "");
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
  const [mediaPreview, setMediaPreview] = useState<{ kind: "audio" | "image"; url: string } | null>(
    null,
  );
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
  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedTaskType = taskType || questionTypes[0]?.code || "";
  const questionType = questionTypes.find((type) => type.code === selectedTaskType);
  const hasOptions = questionType?.requiresOptions ?? false;

  const uploadMedia = async (
    event: ChangeEvent<HTMLInputElement>,
    kind: "AUDIO_PROMPT" | "IMAGE_PROMPT",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
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
      setMediaPreview({
        kind: kind === "AUDIO_PROMPT" ? "audio" : "image",
        url: uploaded.secure_url,
      });
    } catch (uploadError) {
      setError(getUserFacingApiErrorMessage(uploadError, E.MEDIA_UPLOAD));
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!questionType) return setError(E.QUESTION_TYPES_UNAVAILABLE);
    if (!title.trim()) return setError(E.TITLE_REQUIRED);
    if (questionType.requiresPromptText && !promptText.trim()) return setError(E.PROMPT_REQUIRED);
    if (questionType.requiresAudioPrompt && !audioPromptRef) return setError(E.AUDIO_REQUIRED);
    if (questionType.requiresImagePrompt && !imagePromptRef) return setError(E.IMAGE_REQUIRED);
    if (questionType.requiresWordCount && (!minWordCount || !maxWordCount))
      return setError(E.WORD_COUNTS_REQUIRED);
    if (questionType.requiresCorrectAnswer && !hasOptions && !correctAnswerText.trim())
      return setError(E.CORRECT_ANSWER_REQUIRED);
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
      title: title.trim(),
      promptText: promptText || null,
      audioPromptRef,
      imagePromptRef,
      referenceAnswerText: referenceAnswerText || null,
      correctAnswerText: correctAnswerText || null,
      minWordCount: minWordCount ? Number(minWordCount) : null,
      maxWordCount: maxWordCount ? Number(maxWordCount) : null,
      options: hasOptions ? options : [],
    };
    if (question) {
      const payload: UpdateQuestionRequest = { ...content, version: question.version };
      updateMutation.mutate({ id: question.publicId, payload }, { onSuccess: onSaved });
    } else {
      const payload: CreateQuestionRequest = { pteTaskType: selectedTaskType, ...content };
      createMutation.mutate(payload, { onSuccess: onSaved });
    }
  };

  const updateOption = (index: number, patch: Partial<DraftOption>): void => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    );
  };

  return (
    <form className="flex max-w-4xl flex-col gap-4" onSubmit={submit}>
      <h2 className="text-xl font-semibold text-gray-900">
        {question ? T.FORM_EDIT_TITLE : T.FORM_CREATE_TITLE}
      </h2>
      {error && <Alert tone="error">{error}</Alert>}
      {questionTypesError && <Alert tone="error">{E.LOAD_TYPES}</Alert>}
      {(createMutation.isError || updateMutation.isError) && <Alert tone="error">{E.SAVE}</Alert>}
      <label className="text-sm font-medium text-gray-700">
        {T.TASK_TYPE}
        <select
          className={`${fieldClass} mt-1`}
          value={selectedTaskType}
          disabled={Boolean(question) || questionTypesLoading}
          onChange={(event) => setTaskType(event.target.value)}
        >
          {!taskType && <option value="">{T.LOADING_TASK_TYPES}</option>}
          {questionTypes.map((type) => (
            <option key={type.code} value={type.code}>
              {type.displayName} ({type.shortName})
            </option>
          ))}
          {selectedTaskType && !questionTypes.some((type) => type.code === selectedTaskType) && (
            <option value={selectedTaskType}>{selectedTaskType}</option>
          )}
        </select>
      </label>
      <Input label={T.TITLE} value={title} onChange={(event) => setTitle(event.target.value)} />
      <label className="text-sm font-medium text-gray-700">
        {T.PROMPT_TEXT}
        <textarea
          className={`${fieldClass} mt-1 min-h-28`}
          value={promptText}
          onChange={(event) => setPromptText(event.target.value)}
        />
      </label>
      {questionType?.requiresAudioPrompt && (
        <label className="text-sm font-medium text-gray-700">
          {T.AUDIO_PROMPT}
          <input
            className="mt-1 block text-sm"
            type="file"
            accept="audio/wav"
            onChange={(event) => void uploadMedia(event, "AUDIO_PROMPT")}
          />
          {audioPromptRef && (
            <span className="mt-1 block text-xs text-green-700">
              {T.UPLOADED_MEDIA(audioPromptRef)}
            </span>
          )}
        </label>
      )}
      {questionType?.requiresImagePrompt && (
        <label className="text-sm font-medium text-gray-700">
          {T.IMAGE_PROMPT}
          <input
            className="mt-1 block text-sm"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => void uploadMedia(event, "IMAGE_PROMPT")}
          />
          {imagePromptRef && (
            <span className="mt-1 block text-xs text-green-700">
              {T.UPLOADED_MEDIA(imagePromptRef)}
            </span>
          )}
        </label>
      )}
      {mediaPreview?.kind === "audio" && <audio controls src={mediaPreview.url} />}
      {mediaPreview?.kind === "image" && (
        <img
          className="max-h-56 rounded border object-contain"
          src={mediaPreview.url}
          alt={T.PROMPT_PREVIEW_ALT}
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
    </form>
  );
};
