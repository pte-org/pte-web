import type {
  ItemExplanationResponse,
  ScoreExplanationResponse,
  ScoreTraceResponse,
  SkillExplanationResponse,
  TaskTypeParametersResponse,
} from "@pte/api-client";

export const rubricTrace = (overrides: Partial<ScoreTraceResponse> = {}): ScoreTraceResponse => ({
  itemScore: 25,
  rawPercent: 25,
  gateTriggeredBy: null,
  contributions: [
    { key: "CONTENT", achieved: 0, max: 6, effectiveWeight: 6 },
    { key: "FORM", achieved: 2, max: 2, effectiveWeight: 2 },
  ],
  ...overrides,
});

export const item = (overrides: Partial<ItemExplanationResponse> = {}): ItemExplanationResponse => ({
  answerPublicId: "answer-1",
  taskType: "WRITE_ESSAY",
  section: "WRITING",
  scoreSource: "AI",
  itemScore: 25,
  traceKind: "RUBRIC",
  traitScores: { CONTENT: 0, FORM: 2 },
  wordCount: 230,
  rubricVersionPublicId: "rubric-1",
  objectiveRuleCode: null,
  trace: rubricTrace(),
  ...overrides,
});

export const parameters = (
  overrides: Partial<TaskTypeParametersResponse> = {},
): TaskTypeParametersResponse => ({
  taskType: "DESCRIBE_IMAGE",
  traitWeights: { CONTENT: 6, PRONUNCIATION: 5, ORAL_FLUENCY: 5 },
  formBands: null,
  gateEnabled: { CONTENT: true },
  azureMappingVersion: "1",
  azureMappingCalibrated: false,
  azureMappingLabel: "chưa hiệu chỉnh với dữ liệu người chấm",
  ...overrides,
});

export const skill = (overrides: Partial<SkillExplanationResponse> = {}): SkillExplanationResponse => ({
  skill: "WRITING",
  score: 42,
  sufficientData: true,
  weightedSum: 0.123456,
  totalWeight: 0.31,
  ratio: 0.398245,
  scaledScore: 41.8596,
  terms: [
    { taskType: "WRITE_ESSAY", weight: 31, average: 25, contribution: 7.75, excluded: false },
    { taskType: "SUMMARIZE_WRITTEN_TEXT", weight: 12, average: null, contribution: null, excluded: true },
  ],
  ...overrides,
});

export const explanation = (
  overrides: Partial<ScoreExplanationResponse> = {},
): ScoreExplanationResponse => ({
  attemptPublicId: "attempt-1",
  sessionPublicId: "session-1",
  published: true,
  publishedAt: "2026-11-05T10:00:00Z",
  schemaVersion: 2,
  traceAvailable: true,
  includesUnselectedAiScores: false,
  examDefinitionPublicId: "template-1",
  examDefinitionVersion: 3,
  rubricVersionPublicId: "rubric-1",
  rubricParameters: {
    versionPublicId: "rubric-1",
    versionNo: 1,
    status: "ACTIVE",
    catalogVersion: 1,
    taskTypes: [parameters()],
  },
  items: [item()],
  taskTypeAverages: [
    { taskType: "WRITE_ESSAY", scoredCount: 1, blankCount: 1, sum: 25, average: 12.5 },
  ],
  skills: [skill()],
  overall: null,
  ...overrides,
});
