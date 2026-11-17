import { QUESTION_EDITOR_ERRORS, CORRECT_ANSWER_HINTS } from "./constants";

/**
 * The text formats the automatic scorers read from the "correct answer" field. Mirrors the backend check
 * (`CorrectAnswerFormat` in pte-api), so an answer rejected here would also be rejected on save.
 */
type TextKey = "FILL_IN_THE_BLANKS_TYPE_IN" | "HIGHLIGHT_INCORRECT_WORDS" | "ANSWER_SHORT_QUESTION";

function isTextKey(taskKey: string): taskKey is TextKey {
  return taskKey in CORRECT_ANSWER_HINTS;
}

function parseArray(text: string): unknown[] | null {
  try {
    const value: unknown = JSON.parse(text);
    return Array.isArray(value) && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function isTypeInKey(text: string): boolean {
  const items = parseArray(text);
  return items !== null && items.every((item) => typeof item === "string" && item.trim() !== "" && !item.includes(","));
}

function isWordPositionList(text: string): boolean {
  const items = parseArray(text);
  if (items === null) return false;
  const seen = new Set<number>();
  return items.every((item) => {
    if (typeof item !== "number" || !Number.isInteger(item) || item < 0 || seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

function hasShortAnswer(text: string): boolean {
  return text.split("/").some((part) => /[\p{L}\p{N}]/u.test(part));
}

/** Hint shown under the field for task types whose key has a fixed format; null for the others. */
export function correctAnswerHint(taskKey: string): string | null {
  return isTextKey(taskKey) ? CORRECT_ANSWER_HINTS[taskKey] : null;
}

/** An error message when `text` is not in the task type's format; null when it is fine or needs no format. */
export function correctAnswerFormatError(taskKey: string, text: string): string | null {
  if (!isTextKey(taskKey) || text.trim() === "") return null;
  const valid = taskKey === "FILL_IN_THE_BLANKS_TYPE_IN" ? isTypeInKey(text)
    : taskKey === "HIGHLIGHT_INCORRECT_WORDS" ? isWordPositionList(text)
      : hasShortAnswer(text);
  return valid ? null : QUESTION_EDITOR_ERRORS.INVALID_CORRECT_ANSWER_FORMAT;
}
