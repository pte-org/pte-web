import type { RubricTaskParameters, TaskTypeRubricResponse } from "@pte/api-client";

/** The weights of one task type added up: the denominator of each trait's share. */
export function weightTotal(value: RubricTaskParameters): number {
  return Object.values(value.traitWeights).reduce((sum, weight) => sum + weight, 0);
}

/** A trait's share of the total in percent, one decimal; null when nothing carries weight. */
export function weightShare(weight: number, total: number): number | null {
  return total > 0 ? Math.round((weight / total) * 1000) / 10 : null;
}

/** The traits that have a Pearson reference weight (a per-word trait may have none). */
const referenced = (rubric: TaskTypeRubricResponse) =>
  rubric.traits.filter((trait) => trait.defaultWeight !== null && trait.defaultWeight !== undefined);

/** True when every trait that has a Pearson reference weight carries exactly that weight. */
export function matchesPearson(rubric: TaskTypeRubricResponse, value: RubricTaskParameters): boolean {
  return referenced(rubric).every((trait) => value.traitWeights[trait.key] === trait.defaultWeight);
}

/** The same parameters with each referenced trait back at its Pearson weight; gates and scales stay as they are. */
export function resetToPearson(rubric: TaskTypeRubricResponse, value: RubricTaskParameters): RubricTaskParameters {
  const traitWeights = { ...value.traitWeights };
  for (const trait of referenced(rubric)) traitWeights[trait.key] = trait.defaultWeight as number;
  return { ...value, traitWeights };
}
