import type {
  QuestionTypeResponse,
  ScoreTemplateItemResponse,
  ScoreTemplateResponse,
} from "@pte/api-client";

export const taskType = (
  code: string,
  section: string,
  displayOrder: number,
  active = true,
): QuestionTypeResponse => ({
  publicId: `type-${code}`,
  code,
  displayName: code,
  shortName: code,
  section,
  scored: true,
  active,
  displayOrder,
  requiresAudioPrompt: false,
  requiresImagePrompt: false,
  requiresPromptText: true,
  requiresOptions: false,
  requiresCorrectAnswer: false,
  requiresWordCount: false,
  requiresSingleCorrectOption: false,
  usesOptionOrderAsCorrectPosition: false,
  requiresReferenceAnswer: false,
});

export const templateItem = (
  taskTypeKey: string,
  section: string,
  overrides: Partial<ScoreTemplateItemResponse> = {},
): ScoreTemplateItemResponse => ({
  taskType: taskTypeKey,
  taskTypeKey,
  section,
  sequence: 1,
  minCount: 2,
  maxCount: 4,
  prepSeconds: 10,
  responseSeconds: 40,
  scoringMethod: "AI_SPEECH",
  overallWeight: 0,
  speakingWeight: 0,
  writingWeight: 0,
  readingWeight: 0,
  listeningWeight: 0,
  ...overrides,
});

export const template = (
  status: string,
  version: number,
  items: ScoreTemplateItemResponse[] = [],
  tenantId: string | null = null,
): ScoreTemplateResponse => ({
  publicId: `template-${version}`,
  code: "PTE_Score_Template",
  version,
  name: "PTE template",
  status,
  rejectionReason: null,
  items,
  templatePolicy: "STANDARD_PTE",
  tenantId,
});
