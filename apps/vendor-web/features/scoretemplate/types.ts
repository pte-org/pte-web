import type { ScoreTemplateItemResponse, ScoreTemplateResponse } from "@pte/api-client";

export type { ScoreTemplateItemResponse, ScoreTemplateResponse };

export type ScoreTemplateStatusFilter = "ACTIVE" | "DRAFT" | "RETIRED";

/**
 * One row of a DRAFT being edited. Numeric/weight fields stay `string`
 * while the admin types (mirrors `GrantQuotaModal`'s `amount: string`
 * convention) — parsed to numbers only at submit time in
 * `useReplaceScoreTemplateItems`'s caller.
 */
export interface ScoreTemplateItemDraft {
  taskType: string;
  section: string;
  sequence: number;
  minCount: string;
  maxCount: string;
  prepSeconds: string;
  responseSeconds: string;
  scoringMethod: string;
  overallWeight: string;
  speakingWeight: string;
  writingWeight: string;
  readingWeight: string;
  listeningWeight: string;
}

export function toDraft(item: ScoreTemplateItemResponse): ScoreTemplateItemDraft {
  return {
    taskType: item.taskType,
    section: item.section,
    sequence: item.sequence,
    minCount: String(item.minCount),
    maxCount: String(item.maxCount),
    prepSeconds: String(item.prepSeconds),
    responseSeconds: String(item.responseSeconds),
    scoringMethod: item.scoringMethod,
    overallWeight: String(item.overallWeight),
    speakingWeight: String(item.speakingWeight),
    writingWeight: String(item.writingWeight),
    readingWeight: String(item.readingWeight),
    listeningWeight: String(item.listeningWeight),
  };
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function fromDraft(draft: ScoreTemplateItemDraft): ScoreTemplateItemResponse {
  return {
    taskType: draft.taskType,
    section: draft.section,
    sequence: draft.sequence,
    minCount: toNumber(draft.minCount),
    maxCount: toNumber(draft.maxCount),
    prepSeconds: toNumber(draft.prepSeconds),
    responseSeconds: toNumber(draft.responseSeconds),
    scoringMethod: draft.scoringMethod,
    overallWeight: toNumber(draft.overallWeight),
    speakingWeight: toNumber(draft.speakingWeight),
    writingWeight: toNumber(draft.writingWeight),
    readingWeight: toNumber(draft.readingWeight),
    listeningWeight: toNumber(draft.listeningWeight),
  };
}
