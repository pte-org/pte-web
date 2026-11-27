import { ApiError } from "@pte/api-client";
import type { ExaminerWorkText } from "../constants";

/** The answer a backend message names by its public id, as the 1-based question number the examiner sees. */
const questionNumber = (message: string, answerIds: readonly string[]): string => {
  const index = answerIds.findIndex((id) => message.includes(id));
  return index < 0 ? "" : String(index + 1);
};

const withQuestion = (template: string, number: string): string =>
  number ? template.replace("{n}", number) : template.replace("{n}", "?");

/**
 * Turns the error thrown by a failed finalize into the reason the examiner can act on. The backend rejects with
 * plain English reasons (no stable codes yet), so they are recognised by their wording; anything unrecognised
 * falls back to the generic message.
 */
export function getFinalizeFailureText(error: unknown, text: ExaminerWorkText, answerIds: readonly string[]): string {
  if (!(error instanceof ApiError)) return text.FINALIZE_FAILED;
  if (error.kind === "network") return text.FINALIZE_FAILED_NETWORK;
  const message = error.message ?? "";
  const number = questionNumber(message, answerIds);
  if (message.startsWith("Missing complete draft")) return withQuestion(text.FINALIZE_MISSING_DRAFT, number);
  if (message.startsWith("Draft version mismatch") || message.startsWith("CONFIRM_AI score or version")) {
    return withQuestion(text.FINALIZE_STALE_DRAFT, number);
  }
  if (message.startsWith("Expected work version mismatch") || message.startsWith("Expected draft version mismatch")) {
    return text.FINALIZE_STALE_WORK;
  }
  if (message === "Finalize manifest does not match eligible answer pool exactly" || message === "Eligible answer pool is empty") {
    return text.FINALIZE_POOL_CHANGED;
  }
  if (message === "Work must be started before finalization") return text.FINALIZE_NOT_STARTED;
  if (message === "Work is already finalized") return text.FINALIZE_ALREADY;
  if (message.startsWith("Drafts handed over from the previous examiner")) return text.FINALIZE_CARRIED_OVER;
  if (message === "Session scores already published") return text.FINALIZE_PUBLISHED;
  return text.FINALIZE_FAILED;
}
