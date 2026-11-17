import { QUESTION_EDITOR_ERRORS } from "./constants";

/**
 * Checks the word-count limits the author typed. Mirrors the backend rule (`QuestionValidationHelper`): limits are
 * whole numbers from 0 up, and the minimum cannot exceed the maximum. Empty fields are not judged here.
 */
export function wordCountBoundsError(min: string, max: string): string | null {
  const parse = (value: string): number | null | "bad" => {
    if (value.trim() === "") return null;
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : "bad";
  };
  const low = parse(min);
  const high = parse(max);
  if (low === "bad" || high === "bad") return QUESTION_EDITOR_ERRORS.WORD_COUNTS_INVALID;
  if (low !== null && high !== null && low > high) return QUESTION_EDITOR_ERRORS.WORD_COUNTS_INVALID;
  return null;
}
