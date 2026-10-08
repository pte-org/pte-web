import { EXAM_SKILL_OPTIONS } from "../constants";
import type { CreateExamWorkflowInput, ExamSkill } from "../types";
import type { CreateExamWorkflowErrors } from "./validateCreateExamWorkflow";

export type CreateExamStep = 1 | 2 | 3 | 4;
export type ValidatableCreateExamStep = Exclude<CreateExamStep, 4>;

export const CREATE_EXAM_STEP_IDS = ["details", "schedule", "audience", "review"] as const;

export type CreateExamStepId = (typeof CREATE_EXAM_STEP_IDS)[number];

export const CREATE_EXAM_STEP_FIELDS: Record<
  ValidatableCreateExamStep,
  readonly (keyof CreateExamWorkflowErrors)[]
> = {
  1: ["name", "templatePublicId", "subscriptionPublicId", "capacity", "selectedSkills"],
  2: ["opensAt", "closesAt", "maxRetriesPerStudent", "seriesKey"],
  3: ["sources"],
};

export interface TemplateItemLike {
  section?: string | null;
}

export function getTemplateSkills(items?: readonly TemplateItemLike[]): ExamSkill[] {
  return EXAM_SKILL_OPTIONS.filter((option) =>
    items?.some((item) => item.section === option.value),
  ).map((option) => option.value);
}

export function createEmptyExamWorkflow(
  templatePublicId = "",
  selectedSkills: readonly ExamSkill[] = [],
): CreateExamWorkflowInput {
  return {
    name: "",
    templatePublicId,
    subscriptionPublicId: "",
    opensAt: "",
    closesAt: "",
    examMode: "PRACTICE",
    practiceAntiCheatEnabled: false,
    selectedSkills: [...selectedSkills],
    maxRetriesPerStudent: "0",
    formMode: "SHARED_FORM",
    reusePolicy: "ALLOW",
    seriesKey: "",
    capacity: "",
    sources: [],
  };
}

export function getEffectiveExamWorkflowForm(
  form: CreateExamWorkflowInput,
  activeTemplatePublicId?: string,
): CreateExamWorkflowInput {
  return {
    ...form,
    templatePublicId: form.templatePublicId || activeTemplatePublicId || "",
  };
}

export function filterWorkflowErrors(
  errors: CreateExamWorkflowErrors,
  fields: readonly (keyof CreateExamWorkflowErrors)[],
): CreateExamWorkflowErrors {
  const filtered: CreateExamWorkflowErrors = {};
  fields.forEach((field) => {
    const message = errors[field];
    if (message) filtered[field] = message;
  });
  return filtered;
}

export function getCreateExamStepFields(
  step: ValidatableCreateExamStep,
): readonly (keyof CreateExamWorkflowErrors)[] {
  return CREATE_EXAM_STEP_FIELDS[step];
}

export function localizeOptionLabels<T extends { value: string; label: string }>(
  options: readonly T[],
  translate: (key: string, fallback: string) => string,
  keyPrefix: string,
): T[] {
  return options.map((option) => ({
    ...option,
    label: translate(`${keyPrefix}.${option.value}`, option.label),
  }));
}

export function applyExamModeChange(
  previous: CreateExamWorkflowInput,
  examMode: CreateExamWorkflowInput["examMode"],
  templateSkills: readonly ExamSkill[],
): CreateExamWorkflowInput {
  const practice = examMode === "PRACTICE";

  return {
    ...previous,
    examMode,
    practiceAntiCheatEnabled: practice ? previous.practiceAntiCheatEnabled : false,
    selectedSkills: practice ? previous.selectedSkills : [...templateSkills],
    formMode: "SHARED_FORM",
    reusePolicy: "ALLOW",
    seriesKey: "",
    maxRetriesPerStudent: practice ? previous.maxRetriesPerStudent : "0",
  };
}
