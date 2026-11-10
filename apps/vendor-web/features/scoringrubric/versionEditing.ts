import type { RubricParametersDocument, TaskTypeRubricResponse } from "@pte/api-client";
import type { VersionActions } from "./versionTypes";
import { RUBRIC_EDIT_CONFIG } from "./versionConstants";

export function versionActions(status: string, roles: readonly string[], own: boolean): VersionActions {
  const author = roles.some((role) => ["PLATFORM_ADMIN", "ACADEMIC_MANAGER", "ACADEMIC_STAFF", "PLATFORM_AUTHOR"].includes(role));
  const admin = roles.includes("PLATFORM_ADMIN");
  const reviewer = admin || roles.includes("ACADEMIC_MANAGER");
  return {
    edit: author && ["DRAFT", "REJECTED"].includes(status),
    submit: author && status === "DRAFT",
    activate: reviewer && (status === "DRAFT" || (status === "PENDING" && (!own || admin))),
    reject: reviewer && status === "PENDING",
    discard: author && status === "DRAFT",
  };
}

export function canConfirmActivation(checked: boolean, digest: string | null, pending: boolean): boolean {
  return checked && Boolean(digest) && !pending;
}

/** Serialize API declarations without inventing weights, gates, scales or Form rules in the client. */
export function parametersFromRubrics(rubrics: TaskTypeRubricResponse[]): RubricParametersDocument {
  const mapping = rubrics.find((task) => task.azureMapping !== null)?.azureMapping;
  return {
    azureBandMappingVersion: Number(mapping?.version),
    taskTypes: Object.fromEntries(rubrics.map((task) => [task.taskType, {
      traitWeights: Object.fromEntries(task.traits.map((trait) => [trait.key, trait.weight])),
      traitScales: Object.fromEntries(task.traits.map((trait) => [trait.key, trait.perWord ? "PER_WORD" : trait.maxScore ?? 0])),
      formBands: task.formBands?.map((band) => ({ ...band })) ?? null,
      gateEnabled: Object.fromEntries(task.gates.map((gate) => [gate.traitKey, gate.enabled])),
    }])),
  };
}

/** Early editor feedback only; backend validation owns every write and scoring decision. */
export function parametersLookValid(parameters: RubricParametersDocument, rubrics: TaskTypeRubricResponse[]): boolean {
  return rubrics.every((task) => {
    const value = parameters.taskTypes[task.taskType];
    if (!value) return false;
    const weights = Object.entries(value.traitWeights);
    if (weights.some(([key, weight]) => !Number.isInteger(weight) || weight < RUBRIC_EDIT_CONFIG.minWeight
      || weight > RUBRIC_EDIT_CONFIG.maxWeight || (task.gates.some((gate) => gate.traitKey === key) && weight === 0))) return false;
    if (task.traits.length && !weights.some(([, weight]) => weight > 0)) return false;
    const bands = value.formBands;
    if (!bands) return task.formBands === null;
    const max = task.traits.find((trait) => trait.key === "FORM")?.maxScore;
    if (!bands.some((band) => band.band === max)) return false;
    const sorted = [...bands].sort((a, b) => a.minWords - b.minWords);
    return sorted.every((band, index) => Number.isInteger(band.minWords) && Number.isInteger(band.maxWords) && Number.isInteger(band.band)
      && band.minWords >= 0 && band.maxWords >= band.minWords && band.band >= 0 && band.band <= (max ?? 0)
      && (index === 0 || band.minWords > sorted[index - 1].maxWords));
  });
}
