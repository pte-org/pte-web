import type { Locale } from "@pte/ui";
import { RUBRIC_SKILLS, RUBRIC_SKILL_FILTER_ALL } from "./constants";
import type {
  AzureMappingResponse,
  RubricSkill,
  RubricSkillFilter,
  RubricTaskTypeGroup,
  RubricTraitDetailsResponse,
  ScoreTemplateResponse,
  TaskTypeRubricResponse,
  TemplateSkillWeights,
} from "./types";

/**
 * Display helpers for the rubric pages. They only arrange and label what the API returns; no scoring rule,
 * scale or weight is decided here.
 */

export type MessageValues = Record<string, string | number>;

export function formatMessage(template: string, values: MessageValues = {}): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in values ? String(values[name]) : placeholder,
  );
}

/** A task type appears under every skill it counts toward (e.g. Repeat Sentence: Speaking and Listening). */
export function groupTaskTypesBySkill(
  taskTypes: readonly TaskTypeRubricResponse[],
  filter: RubricSkillFilter,
): RubricTaskTypeGroup[] {
  const skills: readonly RubricSkill[] =
    filter === RUBRIC_SKILL_FILTER_ALL ? RUBRIC_SKILLS : [filter];
  return skills
    .map((skill) => ({
      skill,
      taskTypes: taskTypes.filter((taskType) => taskType.skills.includes(skill)),
    }))
    .filter((group) => group.taskTypes.length > 0);
}

export function countDistinctTaskTypes(taskTypes: readonly TaskTypeRubricResponse[]): number {
  return new Set(taskTypes.map((taskType) => taskType.taskType)).size;
}

export function hasEnabledGate(rubric: TaskTypeRubricResponse): boolean {
  return rubric.gates.some((gate) => gate.enabled);
}

export function formatAchievedOfMax(achieved: number, max: number | string): string {
  return `${achieved}/${max}`;
}

/**
 * The sum of the declared trait maxima; a per-word trait (maximum = passage length N) is named by its symbol
 * rather than given a number. Null for answer-key task types, which have no traits.
 */
export function formatRubricMaxTotal(
  traits: readonly RubricTraitDetailsResponse[],
  perWordSymbol: string,
): string | null {
  if (traits.length === 0) return null;
  const fixedTotal = traits.reduce((total, trait) => total + (trait.maxScore ?? 0), 0);
  const hasPerWord = traits.some((trait) => trait.perWord);
  if (!hasPerWord) return String(fixedTotal);
  return fixedTotal > 0 ? `${perWordSymbol} + ${fixedTotal}` : perWordSymbol;
}

export function traitDisplayName(trait: RubricTraitDetailsResponse, locale: Locale): string {
  return locale === "vi" ? trait.displayNameVi : trait.displayNameEn;
}

/** The API's label while the Azure table is uncalibrated; the local wording only if the API sent none. */
export function uncalibratedLabel(
  mapping: Pick<AzureMappingResponse, "calibrated" | "label"> | null,
  fallback: string,
): string | null {
  if (!mapping || mapping.calibrated) return null;
  const label = mapping.label?.trim();
  return label ? label : fallback;
}

/**
 * `undefined` means the admin has not chosen yet: the ACTIVE template is shown. An empty string means "no
 * template", which shows the ACTIVE rubric version without template weights.
 */
export function resolveSelectedTemplate(
  templates: readonly ScoreTemplateResponse[],
  selectedPublicId: string | undefined,
): ScoreTemplateResponse | null {
  if (selectedPublicId === undefined) {
    return templates.find((template) => template.status === "ACTIVE") ?? null;
  }
  return templates.find((template) => template.publicId === selectedPublicId) ?? null;
}

export function findTemplateWeights(
  template: ScoreTemplateResponse,
  taskType: string,
): TemplateSkillWeights | null {
  const item = template.items.find(
    (candidate) => candidate.taskTypeKey === taskType || candidate.taskType === taskType,
  );
  if (!item) return null;
  return {
    overall: item.overallWeight,
    speaking: item.speakingWeight,
    writing: item.writingWeight,
    reading: item.readingWeight,
    listening: item.listeningWeight,
  };
}
