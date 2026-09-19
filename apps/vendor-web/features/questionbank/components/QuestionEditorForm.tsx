"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input } from "@pte/ui";
import {
  completeCloudinaryUpload,
  requestCloudinaryUpload,
  type CreateQuestionRequest,
  type PteTaskType,
  type QuestionResponse,
  type UpdateQuestionRequest,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { useCreateQuestion, useUpdateQuestion } from "../api";

const TASK_TYPES: PteTaskType[] = [
  "PERSONAL_INTRODUCTION", "READ_ALOUD", "REPEAT_SENTENCE", "DESCRIBE_IMAGE",
  "RE_TELL_LECTURE", "ANSWER_SHORT_QUESTION", "RESPOND_TO_A_SITUATION",
  "SUMMARIZE_GROUP_DISCUSSION", "SUMMARIZE_WRITTEN_TEXT", "WRITE_ESSAY",
  "MC_READING_SINGLE", "MC_READING_MULTIPLE", "RE_ORDER_PARAGRAPHS",
  "FILL_BLANKS_READING", "FILL_BLANKS_READING_WRITING", "SUMMARIZE_SPOKEN_TEXT",
  "MC_LISTENING_SINGLE", "MC_LISTENING_MULTIPLE", "FILL_BLANKS_LISTENING",
  "HIGHLIGHT_CORRECT_SUMMARY", "SELECT_MISSING_WORD", "HIGHLIGHT_INCORRECT_WORDS",
  "WRITE_FROM_DICTATION",
];

const AUDIO_TASKS = new Set([
  "REPEAT_SENTENCE", "RE_TELL_LECTURE", "ANSWER_SHORT_QUESTION", "RESPOND_TO_A_SITUATION",
  "SUMMARIZE_GROUP_DISCUSSION", "SUMMARIZE_SPOKEN_TEXT", "MC_LISTENING_SINGLE",
  "MC_LISTENING_MULTIPLE", "FILL_BLANKS_LISTENING", "HIGHLIGHT_CORRECT_SUMMARY",
  "SELECT_MISSING_WORD", "HIGHLIGHT_INCORRECT_WORDS", "WRITE_FROM_DICTATION",
]);
const IMAGE_TASKS = new Set(["DESCRIBE_IMAGE"]);
const OPTION_TASKS = new Set([
  "MC_READING_SINGLE", "MC_READING_MULTIPLE", "RE_ORDER_PARAGRAPHS",
  "FILL_BLANKS_READING", "FILL_BLANKS_READING_WRITING", "MC_LISTENING_SINGLE",
  "MC_LISTENING_MULTIPLE", "HIGHLIGHT_CORRECT_SUMMARY", "SELECT_MISSING_WORD",
]);
const PROMPT_TASKS = new Set([
  "PERSONAL_INTRODUCTION", "READ_ALOUD", "RESPOND_TO_A_SITUATION", "SUMMARIZE_WRITTEN_TEXT", "WRITE_ESSAY",
  "MC_READING_SINGLE", "MC_READING_MULTIPLE", "FILL_BLANKS_READING",
  "FILL_BLANKS_READING_WRITING", "FILL_BLANKS_LISTENING", "HIGHLIGHT_INCORRECT_WORDS",
]);
const WORD_COUNT_TASKS = new Set(["SUMMARIZE_WRITTEN_TEXT", "WRITE_ESSAY", "SUMMARIZE_SPOKEN_TEXT"]);
const CORRECT_TEXT_TASKS = new Set([
  "ANSWER_SHORT_QUESTION", "FILL_BLANKS_LISTENING", "HIGHLIGHT_INCORRECT_WORDS", "WRITE_FROM_DICTATION",
]);

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
}

const fieldClass = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export const QuestionEditorForm = ({ question, onSaved }: QuestionEditorFormProps): ReactElement => {
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const [taskType, setTaskType] = useState<string>(question?.pteTaskType ?? "READ_ALOUD");
  const [title, setTitle] = useState(question?.title ?? "");
  const [promptText, setPromptText] = useState(question?.promptText ?? "");
  const [referenceAnswerText, setReferenceAnswerText] = useState(question?.referenceAnswerText ?? "");
  const [correctAnswerText, setCorrectAnswerText] = useState(question?.correctAnswerText ?? "");
  const [minWordCount, setMinWordCount] = useState(question?.minWordCount?.toString() ?? "");
  const [maxWordCount, setMaxWordCount] = useState(question?.maxWordCount?.toString() ?? "");
  const [audioPromptRef, setAudioPromptRef] = useState<string | null>(question?.audioPromptRef ?? null);
  const [imagePromptRef, setImagePromptRef] = useState<string | null>(question?.imagePromptRef ?? null);
  const [mediaPreview, setMediaPreview] = useState<{ kind: "audio" | "image"; url: string } | null>(null);
  const [options, setOptions] = useState<DraftOption[]>(() => question?.options.map((option) => ({
    text: option.text, correct: option.correct, orderIndex: option.orderIndex,
    blankIndex: option.blankIndex, correctGapIndex: option.correctGapIndex,
  })) ?? [{ text: "", correct: true, orderIndex: 0 }, { text: "", correct: false, orderIndex: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const hasOptions = OPTION_TASKS.has(taskType);

  const uploadMedia = async (event: ChangeEvent<HTMLInputElement>, kind: "AUDIO_PROMPT" | "IMAGE_PROMPT") => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const signed = await requestCloudinaryUpload(apiClient, { contentType: file.type, assetKind: kind, sizeBytes: file.size });
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signed.apiKey);
      body.append("timestamp", signed.timestamp);
      body.append("signature", signed.signature);
      body.append("folder", signed.folder);
      body.append("public_id", signed.mediaPublicId);
      const response = await fetch(signed.uploadUrl, { method: "POST", body });
      if (!response.ok) throw new Error("Cloudinary upload failed");
      const uploaded = (await response.json()) as {
        public_id: string; asset_id: string; secure_url: string; resource_type: string;
        format?: string; bytes?: number; duration?: number; version?: number; signature?: string;
      };
      await completeCloudinaryUpload(apiClient, signed.mediaPublicId, {
        publicId: uploaded.public_id, assetId: uploaded.asset_id, secureUrl: uploaded.secure_url,
        resourceType: uploaded.resource_type, format: uploaded.format, bytes: uploaded.bytes,
        durationSeconds: uploaded.duration, version: uploaded.version, signature: uploaded.signature,
      });
      if (kind === "AUDIO_PROMPT") setAudioPromptRef(signed.mediaPublicId);
      else setImagePromptRef(signed.mediaPublicId);
      setMediaPreview({ kind: kind === "AUDIO_PROMPT" ? "audio" : "image", url: uploaded.secure_url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Media upload failed");
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required.");
    if (PROMPT_TASKS.has(taskType) && !promptText.trim()) return setError("Prompt text is required for this task.");
    if (AUDIO_TASKS.has(taskType) && !audioPromptRef) return setError("An audio prompt is required for this task.");
    if (IMAGE_TASKS.has(taskType) && !imagePromptRef) return setError("An image prompt is required for this task.");
    if (WORD_COUNT_TASKS.has(taskType) && (!minWordCount || !maxWordCount)) return setError("Minimum and maximum word counts are required for this task.");
    if (CORRECT_TEXT_TASKS.has(taskType) && !correctAnswerText.trim()) return setError("A correct answer is required for this task.");
    if (hasOptions && (options.length === 0 || options.some((option) => !option.text.trim()))) {
      return setError("Every option must contain text.");
    }
    if (hasOptions && taskType !== "RE_ORDER_PARAGRAPHS" && options.every((option) => !option.correct)) {
      return setError("Select at least one correct option.");
    }
    if ((taskType === "MC_READING_SINGLE" || taskType === "MC_LISTENING_SINGLE")
      && options.filter((option) => option.correct).length !== 1) {
      return setError("Single-choice tasks require exactly one correct option.");
    }
    const content = {
      title: title.trim(), promptText: promptText || null, audioPromptRef, imagePromptRef,
      referenceAnswerText: referenceAnswerText || null, correctAnswerText: correctAnswerText || null,
      minWordCount: minWordCount ? Number(minWordCount) : null,
      maxWordCount: maxWordCount ? Number(maxWordCount) : null,
      options: hasOptions ? options : [],
    };
    if (question) {
      const payload: UpdateQuestionRequest = { ...content, version: question.version };
      updateMutation.mutate({ id: question.publicId, payload }, { onSuccess: onSaved });
    } else {
      const payload: CreateQuestionRequest = { pteTaskType: taskType, ...content };
      createMutation.mutate(payload, { onSuccess: onSaved });
    }
  };

  const updateOption = (index: number, patch: Partial<DraftOption>): void => {
    setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? { ...option, ...patch } : option));
  };

  return (
    <form className="flex max-w-4xl flex-col gap-4" onSubmit={submit}>
      <h2 className="text-xl font-semibold text-gray-900">{question ? "Edit Question Revision" : "Create PTE Question"}</h2>
      {error && <Alert tone="error">{error}</Alert>}
      {(createMutation.isError || updateMutation.isError) && <Alert tone="error">Could not save the question. Check the required fields and try again.</Alert>}
      <label className="text-sm font-medium text-gray-700">
        Task type
        <select className={`${fieldClass} mt-1`} value={taskType} disabled={Boolean(question)} onChange={(event) => setTaskType(event.target.value)}>
          {TASK_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
        </select>
      </label>
      <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
      <label className="text-sm font-medium text-gray-700">Prompt text<textarea className={`${fieldClass} mt-1 min-h-28`} value={promptText} onChange={(event) => setPromptText(event.target.value)} /></label>
      {AUDIO_TASKS.has(taskType) && <label className="text-sm font-medium text-gray-700">Audio prompt<input className="mt-1 block text-sm" type="file" accept="audio/wav" onChange={(event) => void uploadMedia(event, "AUDIO_PROMPT")} />{audioPromptRef && <span className="mt-1 block text-xs text-green-700">Uploaded media: {audioPromptRef}</span>}</label>}
      {IMAGE_TASKS.has(taskType) && <label className="text-sm font-medium text-gray-700">Image prompt<input className="mt-1 block text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadMedia(event, "IMAGE_PROMPT")} />{imagePromptRef && <span className="mt-1 block text-xs text-green-700">Uploaded media: {imagePromptRef}</span>}</label>}
      {mediaPreview?.kind === "audio" && <audio controls src={mediaPreview.url} />}
      {mediaPreview?.kind === "image" && <img className="max-h-56 rounded border object-contain" src={mediaPreview.url} alt="Question prompt preview" />}
      <div className="grid gap-4 md:grid-cols-2"><Input label="Minimum word count" type="number" value={minWordCount} onChange={(event) => setMinWordCount(event.target.value)} /><Input label="Maximum word count" type="number" value={maxWordCount} onChange={(event) => setMaxWordCount(event.target.value)} /></div>
      <Input label="Reference answer" value={referenceAnswerText} onChange={(event) => setReferenceAnswerText(event.target.value)} />
      <Input label="Correct answer" value={correctAnswerText} onChange={(event) => setCorrectAnswerText(event.target.value)} />
      {hasOptions && <fieldset className="flex flex-col gap-3 rounded-md border border-gray-200 p-4"><legend className="px-1 text-sm font-medium text-gray-700">Options</legend>{options.map((option, index) => <div className="flex items-center gap-2" key={index}><input type="checkbox" checked={option.correct} onChange={(event) => updateOption(index, { correct: event.target.checked })} aria-label={`Correct option ${index + 1}`} /><Input value={option.text} placeholder={`Option ${index + 1}`} onChange={(event) => updateOption(index, { text: event.target.value })} /><Button type="button" variant="ghost" size="sm" onClick={() => setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))}>Remove</Button></div>)}<Button type="button" variant="secondary" size="sm" onClick={() => setOptions((current) => [...current, { text: "", correct: false, orderIndex: current.length }])}>Add option</Button></fieldset>}
      <section className="rounded-md border border-blue-100 bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-blue-900">Question preview</h3>
        <p className="mt-2 text-base font-medium text-slate-900">{title || "Untitled question"}</p>
        {promptText && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{promptText}</p>}
        {options.length > 0 && hasOptions && <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">{options.filter((option) => option.text.trim()).map((option, index) => <li key={`${option.orderIndex}-${index}`}>{option.text}</li>)}</ol>}
      </section>
      <Button type="submit" isLoading={isPending}>{question ? "Save Draft" : "Create Draft"}</Button>
    </form>
  );
};
