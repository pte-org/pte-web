import type { QuestionResponse, QuestionTypeResponse } from "@pte/api-client";
import type { QuestionPreviewDraft } from "./types";

export interface PreviewMediaUrls {
  imageUrl: string | null;
  audioUrl: string | null;
}

/**
 * The exam screen's input for a saved question. The task type supplies the name, instruction and
 * which slots it takes; without it (e.g. a retired type) the question's own media decides.
 */
export const buildQuestionPreviewDraft = (
  question: QuestionResponse,
  questionType: QuestionTypeResponse | undefined,
  media: PreviewMediaUrls,
): QuestionPreviewDraft => {
  const options = question.options
    .slice()
    .sort((left, right) => left.orderIndex - right.orderIndex);
  const hasOptions = options.length > 0;
  const singleChoice =
    questionType?.requiresSingleCorrectOption ??
    options.filter((option) => option.correct).length <= 1;
  const code = question.taskTypeKey ?? question.pteTaskType ?? "";
  return {
    taskType: code,
    taskName: questionType?.displayName ?? code,
    section: questionType?.section ?? question.section ?? "",
    instruction: questionType?.instruction ?? null,
    promptText: question.promptText ?? "",
    options: options.map((option) => option.text),
    multipleChoice: hasOptions && !singleChoice,
    needsWordCount: questionType?.requiresWordCount ?? question.minWordCount != null,
    minWordCount: question.minWordCount ?? null,
    maxWordCount: question.maxWordCount ?? null,
    expectsImage: questionType?.requiresImagePrompt ?? Boolean(question.imagePromptRef),
    expectsAudio: questionType?.requiresAudioPrompt ?? Boolean(question.audioPromptRef),
    imageUrl: media.imageUrl,
    audioUrl: media.audioUrl,
  };
};
