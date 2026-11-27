import type { QuestionResponse } from "@pte/api-client";

/**
 * The authored content of a question in the same shape the API stores as its audit snapshot
 * (`QuestionAuditState`), so a revision comparison and a draft-edit diff read the same field names.
 */
export function questionAuditState(question: QuestionResponse): Record<string, unknown> {
  return {
    taskTypeKey: question.taskTypeKey ?? null,
    cefrLevel: question.cefrLevel ?? null,
    promptText: question.promptText,
    audioPromptRef: question.audioPromptRef,
    imagePromptRef: question.imagePromptRef,
    referenceAnswerText: question.referenceAnswerText,
    correctAnswerText: question.correctAnswerText,
    minWordCount: question.minWordCount,
    maxWordCount: question.maxWordCount,
    answerHintVi: question.answerHintVi ?? null,
    answerHintEn: question.answerHintEn ?? null,
    availableForExam: question.availableForExam ?? null,
    availableForPractice: question.availableForPractice ?? null,
    options: [...question.options]
      .sort(
        (left, right) =>
          left.orderIndex - right.orderIndex || (left.blankIndex ?? -1) - (right.blankIndex ?? -1),
      )
      .map((option) => ({
        orderIndex: option.orderIndex,
        blankIndex: option.blankIndex ?? null,
        text: option.text,
        correct: option.correct,
        correctGapIndex: option.correctGapIndex ?? null,
      })),
  };
}
