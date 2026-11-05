import type {
  RubricTraitDetailsResponse,
  ScoreTemplateItemResponse,
  ScoreTemplateResponse,
  TaskTypeRubricResponse,
} from "@pte/api-client";

export const trait = (
  key: string,
  maxScore: number | null,
  perWord = false,
  overrides: Partial<RubricTraitDetailsResponse> = {},
): RubricTraitDetailsResponse => ({
  key,
  displayNameVi: `${key} vi`,
  displayNameEn: `${key} en`,
  maxScore,
  perWord,
  source: "AI_LLM",
  pearsonPages: "20-21",
  weight: maxScore ?? 1,
  levels: [],
  ...overrides,
});

export const rubric = (
  taskType: string,
  skills: string[],
  overrides: Partial<TaskTypeRubricResponse> = {},
): TaskTypeRubricResponse => ({
  taskType,
  skills,
  pearsonPages: "15-16",
  versionPublicId: "version-1",
  versionNo: 1,
  catalogVersion: 1,
  traits: [],
  gates: [],
  formBands: null,
  objectiveRule: null,
  azureMapping: null,
  ...overrides,
});

export const template = (
  publicId: string,
  status: string,
  items: Partial<ScoreTemplateItemResponse>[] = [],
): ScoreTemplateResponse => ({
  publicId,
  code: publicId.toUpperCase(),
  version: 1,
  name: publicId,
  status,
  rejectionReason: null,
  templatePolicy: "STANDARD_PTE",
  rubricVersionPublicId: `${publicId}-rubric`,
  items: items.map((item) => ({
    taskType: item.taskTypeKey ?? null,
    taskTypeKey: "",
    section: "SPEAKING",
    sequence: 1,
    minCount: 1,
    maxCount: 1,
    prepSeconds: 0,
    responseSeconds: 0,
    scoringMethod: "AI_SPEECH",
    overallWeight: 0,
    speakingWeight: 0,
    writingWeight: 0,
    readingWeight: 0,
    listeningWeight: 0,
    ...item,
  })),
});
