import type {
  QuestionTypeResponse,
  ReplaceScoreTemplateItemsRequest,
  ScoreTemplateResponse,
} from "@pte/api-client";
import { createDraftItem } from "../scoretemplate/addTaskType";
import { PLATFORM_TEMPLATE_POLICY } from "../scoretemplate/constants";
import { fromDraft, toDraft, type ScoreTemplateItemDraft } from "../scoretemplate/types";
import { STUDIO_MAX_COUNT_LIMIT } from "./constants";

const resequence = (items: ScoreTemplateItemDraft[]): ScoreTemplateItemDraft[] =>
  items.map((item, index) => ({ ...item, sequence: index + 1 }));

const mapItem = (
  items: ScoreTemplateItemDraft[],
  key: string,
  change: (item: ScoreTemplateItemDraft) => ScoreTemplateItemDraft,
): ScoreTemplateItemDraft[] => items.map((item) => (item.taskTypeKey === key ? change(item) : item));

export const draftsOf = (template: ScoreTemplateResponse): ScoreTemplateItemDraft[] =>
  template.items.map(toDraft);

/** Sets how many questions an exam draws for the task type; the minimum never exceeds it. */
export function withMaxCount(
  items: ScoreTemplateItemDraft[],
  key: string,
  count: number,
): ScoreTemplateItemDraft[] {
  const clamped = Math.max(1, Math.min(STUDIO_MAX_COUNT_LIMIT, count));
  return mapItem(items, key, (item) => ({
    ...item,
    maxCount: String(clamped),
    minCount: String(Math.min(Number(item.minCount), clamped)),
  }));
}

export function withSeconds(
  items: ScoreTemplateItemDraft[],
  key: string,
  field: "prepSeconds" | "responseSeconds",
  seconds: number,
): ScoreTemplateItemDraft[] {
  return mapItem(items, key, (item) => ({ ...item, [field]: String(seconds) }));
}

/** A new row has no skill weight, so the totals of the other rows stay valid. */
export const withTaskType = (
  items: ScoreTemplateItemDraft[],
  type: QuestionTypeResponse,
): ScoreTemplateItemDraft[] => [...items, createDraftItem(type, items.length + 1)];

export const withoutTaskType = (
  items: ScoreTemplateItemDraft[],
  key: string,
): ScoreTemplateItemDraft[] => resequence(items.filter((item) => item.taskTypeKey !== key));

export const buildReplacePayload = (
  template: ScoreTemplateResponse,
  items: ScoreTemplateItemDraft[],
): ReplaceScoreTemplateItemsRequest => ({
  name: template.name,
  items: items.map(fromDraft),
  templatePolicy: PLATFORM_TEMPLATE_POLICY,
});
