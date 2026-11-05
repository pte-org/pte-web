import type { ExaminerRubricResponse, ExaminerAiReferenceResponse, ScoreTraceResponse } from "@pte/api-client";
import type { DraftEntry } from "./submissionTypes";

/** Serializes only API-declared editable traits; machine traits request the same-answer fallback. */
export function traitRequest(rubric: ExaminerRubricResponse, values: Record<string, number | null> = {}): Record<string, number | null> | null {
  const requested: Record<string, number | null> = {};
  for (const trait of rubric.traits) {
    if (trait.useAiWhenNull) { requested[trait.key] = null; continue; }
    if (!trait.editable) continue;
    const value = values[trait.key];
    if (value === null || value === undefined || !Number.isInteger(value) || value < 0 || value > trait.maxScore) return null;
    requested[trait.key] = value;
  }
  return requested;
}

export function aiTraitDraft(rubric: ExaminerRubricResponse, ai: ExaminerAiReferenceResponse | null): Record<string, number | null> | null {
  if (ai?.availability !== "AVAILABLE" || ai.rubricVersionPublicId !== rubric.rubricVersionPublicId) return null;
  const values = ai.traitScores ?? {};
  if (rubric.traits.some((trait) => values[trait.key] === undefined)) return null;
  return traitRequest(rubric, values);
}

export function sameDraftInput(a: { score: string; comment?: string; traitScores?: Record<string, number | null>; decisionKind: string },
  b: { score: string; comment?: string; traitScores?: Record<string, number | null>; decisionKind: string }): boolean {
  return a.score === b.score && a.comment === b.comment && a.decisionKind === b.decisionKind &&
    JSON.stringify(Object.entries(a.traitScores ?? {}).sort()) === JSON.stringify(Object.entries(b.traitScores ?? {}).sort());
}

type SavedDraftFields = Pick<DraftEntry, "draftVersion" | "savedAt" | "itemScore" | "scoreTrace" | "isDirty">;
interface DraftSaveResult { itemScore?: number | null; scoreTrace?: ScoreTraceResponse | null;
  draft?: { draftVersion: number; savedAt: string } | null; }

/** The item score is shown only from the server response, and only while it still describes the on-screen traits. */
export function applySavedDraft<T extends DraftEntry>(current: T, sent: DraftEntry, response: DraftSaveResult): T & SavedDraftFields {
  const changed = !sameDraftInput(current, sent);
  return { ...current, draftVersion: response.draft?.draftVersion ?? (sent.draftVersion ?? 0) + 1,
    savedAt: response.draft?.savedAt ?? null, itemScore: changed ? null : response.itemScore ?? null,
    scoreTrace: changed ? null : response.scoreTrace ?? null, isDirty: changed };
}
