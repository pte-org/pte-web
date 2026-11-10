import { ApiError } from "@pte/api-client";
import {
  HIDDEN_EXPLANATION_STATUSES,
  MAX_EXPLANATION_RETRIES,
  NO_VALUE,
  SCORE_EXPLANATION_PATHS,
} from "./constants";
import type { ScoreExplanationMessageKey } from "./messages/en";
import type {
  ItemExplanationResponse,
  ScoreExplanationResponse,
  ScoreExplanationRole,
  TaskTypeParametersResponse,
  TraitTraceRow,
} from "./types";

/**
 * Display decisions for the score explanation screen. Every number shown comes from the API unchanged; nothing
 * here recalculates a score, an average or a skill sum.
 */

export type MessageValues = Record<string, string | number>;
export type ExplanationScreenState = "loading" | "hidden" | "error" | "ready";

const KNOWN_TRACE_KINDS = new Set([
  "RUBRIC",
  "LEGACY_NO_TRACE",
  "EXAMINER_SCORE",
  "OBJECTIVE",
  "UNSCORED",
  "NOT_SCORED",
  "TRACE_UNAVAILABLE",
]);

export function formatMessage(template: string, values: MessageValues = {}): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in values ? String(values[name]) : placeholder,
  );
}

/** API numbers are shown exactly as sent (no rounding); a missing one is a dash. */
export function formatApiNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? NO_VALUE : String(value);
}

export function isHiddenExplanationError(error: unknown): boolean {
  return error instanceof ApiError && HIDDEN_EXPLANATION_STATUSES.includes(error.status);
}

export function shouldRetryExplanation(failureCount: number, error: unknown): boolean {
  return !isHiddenExplanationError(error) && failureCount < MAX_EXPLANATION_RETRIES;
}

interface ExplanationQueryState {
  isLoading: boolean;
  error: unknown;
  data: ScoreExplanationResponse | undefined;
  /** The exam in the address; an attempt of another exam is treated as not visible. */
  expectedSessionPublicId?: string;
}

export function explanationScreenState({
  isLoading,
  error,
  data,
  expectedSessionPublicId,
}: ExplanationQueryState): ExplanationScreenState {
  if (isLoading) return "loading";
  if (error) return isHiddenExplanationError(error) ? "hidden" : "error";
  if (!data) return "loading";
  if (expectedSessionPublicId && data.sessionPublicId !== expectedSessionPublicId) return "hidden";
  return "ready";
}

export function scoreExplanationHref(
  role: ScoreExplanationRole,
  sessionPublicId: string,
  attemptPublicId: string,
): string {
  return role === "HOST_ADMIN"
    ? SCORE_EXPLANATION_PATHS.host(sessionPublicId, attemptPublicId)
    : SCORE_EXPLANATION_PATHS.examiner(sessionPublicId, attemptPublicId);
}

export function shouldShowNoTraceNotice(response: ScoreExplanationResponse): boolean {
  return !response.traceAvailable;
}

export function traceKindMessageKey(kind: string): ScoreExplanationMessageKey {
  return KNOWN_TRACE_KINDS.has(kind) ? (`kind${kind}` as ScoreExplanationMessageKey) : "kindUnknown";
}

export function traitTraceRows(item: ItemExplanationResponse): TraitTraceRow[] {
  if (!item.trace) return [];
  const gate = item.trace.gateTriggeredBy;
  return item.trace.contributions.map((contribution) => ({
    key: contribution.key,
    achieved: contribution.achieved,
    max: contribution.max,
    effectiveWeight: contribution.effectiveWeight,
    weightedContribution: contribution.weightedContribution,
    gateTriggered: contribution.key === gate,
  }));
}

/** Stored trait scores are listed on their own only when no rubric trace already shows them. */
export function storedTraitEntries(item: ItemExplanationResponse): [string, number][] {
  if (item.trace || !item.traitScores) return [];
  return Object.entries(item.traitScores);
}

/** The API's uncalibrated label for an Azure-scored task type; null when calibrated or not Azure-scored. */
export function uncalibratedAzureLabel(
  parameters: Pick<TaskTypeParametersResponse, "azureMappingCalibrated" | "azureMappingLabel">,
  fallback: string,
): string | null {
  if (parameters.azureMappingCalibrated !== false) return null;
  const label = parameters.azureMappingLabel?.trim();
  return label ? label : fallback;
}
