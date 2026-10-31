import type {
  ScoreTemplateItemRequest,
  ScoreTemplateItemResponse,
  SkillName,
  SkillTaskWeight,
  SkillWeightItem,
} from "@pte/api-client";
import { FULL_SKILL_WEIGHT, SKILLS, WEIGHT_TOLERANCE } from "../constants";

export type WeightField = "speakingWeight" | "writingWeight" | "readingWeight" | "listeningWeight";

export const WEIGHT_FIELD: Record<SkillName, WeightField> = {
  SPEAKING: "speakingWeight",
  WRITING: "writingWeight",
  READING: "readingWeight",
  LISTENING: "listeningWeight",
};

export interface SkillTotal {
  skill: SkillName;
  total: number;
  /** The skill's own part still has tasks, so its column must be exactly 100. */
  hasOwnTasks: boolean;
  ok: boolean;
}

const sameAmount = (left: number, right: number): boolean =>
  Math.abs(left - right) < WEIGHT_TOLERANCE;

const asNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Mirrors the backend rule: 100 when the skill's own part has tasks, otherwise 0 or 100. */
export function computeSkillTotals(items: readonly ScoreTemplateItemRequest[]): SkillTotal[] {
  return SKILLS.map((skill) => {
    const total = items.reduce((sum, item) => sum + asNumber(item[WEIGHT_FIELD[skill]]), 0);
    const hasOwnTasks = items.some((item) => item.section === skill);
    const ok = sameAmount(total, FULL_SKILL_WEIGHT) || (!hasOwnTasks && sameAmount(total, 0));
    return { skill, total, hasOwnTasks, ok };
  });
}

/** True when the weights break no rule and the overall score would be above 0. */
export function areWeightsValid(totals: readonly SkillTotal[]): boolean {
  return totals.every((entry) => entry.ok) && totals.some((entry) => entry.total > WEIGHT_TOLERANCE);
}

export function toEditableItems(
  items: readonly ScoreTemplateItemResponse[],
): ScoreTemplateItemRequest[] {
  return items.map((item) => ({
    taskType: item.taskType,
    taskTypeKey: item.taskTypeKey,
    section: item.section,
    sequence: item.sequence,
    minCount: item.minCount,
    maxCount: item.maxCount,
    prepSeconds: item.prepSeconds,
    responseSeconds: item.responseSeconds,
    speakingWeight: asNumber(item.speakingWeight),
    writingWeight: asNumber(item.writingWeight),
    readingWeight: asNumber(item.readingWeight),
    listeningWeight: asNumber(item.listeningWeight),
  }));
}

export function toSuggestionItems(items: readonly ScoreTemplateItemRequest[]): SkillWeightItem[] {
  return items.map((item) => ({
    taskTypeKey: item.taskTypeKey,
    section: item.section,
    speakingWeight: asNumber(item.speakingWeight),
    writingWeight: asNumber(item.writingWeight),
    readingWeight: asNumber(item.readingWeight),
    listeningWeight: asNumber(item.listeningWeight),
  }));
}

/** Keeps `sequence` contiguous after a removal so the backend never sees gaps. */
export function removeItem(
  items: readonly ScoreTemplateItemRequest[],
  taskTypeKey: string,
): ScoreTemplateItemRequest[] {
  return items
    .filter((item) => item.taskTypeKey !== taskTypeKey)
    .map((item, index) => ({ ...item, sequence: index + 1 }));
}

export function setWeight(
  items: readonly ScoreTemplateItemRequest[],
  taskTypeKey: string,
  skill: SkillName,
  value: number,
): ScoreTemplateItemRequest[] {
  const field = WEIGHT_FIELD[skill];
  return items.map((item) => (item.taskTypeKey === taskTypeKey ? { ...item, [field]: value } : item));
}

/** Writes a suggested column onto the rows; tasks the suggestion does not list are left as they are. */
export function applySuggestedColumn(
  items: readonly ScoreTemplateItemRequest[],
  skill: SkillName,
  weights: readonly SkillTaskWeight[],
): ScoreTemplateItemRequest[] {
  const field = WEIGHT_FIELD[skill];
  const byKey = new Map(weights.map((entry) => [entry.taskTypeKey, entry.weight]));
  return items.map((item) =>
    byKey.has(item.taskTypeKey) ? { ...item, [field]: byKey.get(item.taskTypeKey) ?? 0 } : item,
  );
}

export function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}
