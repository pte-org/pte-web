import type { CreateQuestionRequest, QuestionTypeResponse } from "@pte/api-client";
import type { QuestionPreviewDraft } from "@/features/questionbank/types";

/**
 * Keys of the writer's raw JSON that the student reads as the prompt, in reading order. The server maps the finished
 * draft into the question's fields; until then these show the text as it is typed.
 */
const PROMPT_KEYS = ["passage", "passageWithSlots", "displayedText", "essayPrompt", "question"];
const OPTIONS_KEY = "options";
const PROMPT_JOIN = "\n\n";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function typedPrompt(typed: unknown): string {
  if (!isRecord(typed)) return "";
  return PROMPT_KEYS.map((key) => typed[key])
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(PROMPT_JOIN);
}

export function typedOptions(typed: unknown): string[] {
  if (!isRecord(typed) || !Array.isArray(typed[OPTIONS_KEY])) return [];
  return typed[OPTIONS_KEY].map((option) => (typeof option === "string" ? option : ""));
}

export interface LivePreviewInput {
  taskType: string;
  questionType: QuestionTypeResponse | undefined;
  /** The writer's half-written JSON, parsed as far as it goes. */
  typed: unknown;
  /** The finished draft as question fields, once the server has mapped it. */
  fields: Partial<CreateQuestionRequest> | null;
  audioUrl: string | null;
  imageUrl: string | null;
}

/** The student's exam screen for a question an AI run is still writing: typed text first, the mapped draft once ready. */
export function livePreviewDraft({
  taskType,
  questionType,
  typed,
  fields,
  audioUrl,
  imageUrl,
}: LivePreviewInput): QuestionPreviewDraft {
  const options = fields?.options
    ? fields.options
        .slice()
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .map((option) => option.text)
    : typedOptions(typed);
  return {
    taskType,
    taskName: questionType?.displayName ?? taskType,
    section: questionType?.section ?? "",
    instruction: questionType?.instruction ?? null,
    promptText: fields ? (fields.promptText ?? "") : typedPrompt(typed),
    options,
    multipleChoice: options.length > 0 && !(questionType?.requiresSingleCorrectOption ?? true),
    needsWordCount: questionType?.requiresWordCount ?? false,
    minWordCount: fields?.minWordCount ?? null,
    maxWordCount: fields?.maxWordCount ?? null,
    expectsImage: questionType?.requiresImagePrompt ?? false,
    expectsAudio: questionType?.requiresAudioPrompt ?? false,
    imageUrl,
    audioUrl,
  };
}
