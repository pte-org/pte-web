import { EXAM_TEMPLATE_SECTIONS } from "./constants";
import type { ScoreTemplateItemDraft } from "./types";

type TemplateSkill = (typeof EXAM_TEMPLATE_SECTIONS)[number];

/** Every skill column that carries weight must total exactly this much (backend rule). */
export const SKILL_WEIGHT_REQUIRED_TOTAL = 100;
const WEIGHT_TOLERANCE = 0.005;

export interface SkillWeightTotal {
  skill: TemplateSkill;
  total: number;
  isValid: boolean;
}

const WEIGHT_FIELDS: Record<TemplateSkill, keyof ScoreTemplateItemDraft> = {
  SPEAKING: "speakingWeight",
  WRITING: "writingWeight",
  READING: "readingWeight",
  LISTENING: "listeningWeight",
};

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** A column nobody contributes to (total 0) is allowed; any other total must be exactly 100. */
export function computeSkillWeightTotals(items: ScoreTemplateItemDraft[]): SkillWeightTotal[] {
  return EXAM_TEMPLATE_SECTIONS.map((skill) => {
    const total =
      Math.round(
        items.reduce((sum, item) => sum + toNumber(String(item[WEIGHT_FIELDS[skill]])), 0) * 100,
      ) / 100;
    const isValid =
      Math.abs(total) < WEIGHT_TOLERANCE ||
      Math.abs(total - SKILL_WEIGHT_REQUIRED_TOTAL) < WEIGHT_TOLERANCE;
    return { skill, total, isValid };
  });
}

/** Names only the columns that miss 100, e.g. "Speaking 101, Reading 99.5"; null when all are fine. */
export function describeSkillWeightMismatch(
  items: ScoreTemplateItemDraft[],
  skillLabels: Record<TemplateSkill, string>,
): string | null {
  const invalid = computeSkillWeightTotals(items).filter((entry) => !entry.isValid);
  if (invalid.length === 0) return null;
  return invalid.map((entry) => `${skillLabels[entry.skill]} ${entry.total}`).join(", ");
}
