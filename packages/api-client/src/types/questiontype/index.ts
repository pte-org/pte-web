export type QuestionTypeSection = "SPEAKING" | "WRITING" | "READING" | "LISTENING";

export interface SupportedQuestionTypeResponse {
  code: string;
  section: QuestionTypeSection;
  scored: boolean;
}

export interface QuestionTypeResponse {
  publicId: string;
  code: string;
  displayName: string;
  shortName: string;
  section: QuestionTypeSection | string;
  scored: boolean;
  active: boolean;
  displayOrder: number;
  requiresAudioPrompt: boolean;
  requiresImagePrompt: boolean;
  requiresPromptText: boolean;
  requiresOptions: boolean;
  requiresCorrectAnswer: boolean;
  requiresWordCount: boolean;
  requiresSingleCorrectOption: boolean;
  usesOptionOrderAsCorrectPosition: boolean;
}

export interface CreateQuestionTypeRequest {
  code: string;
  displayName: string;
  shortName: string;
  section: QuestionTypeSection;
  displayOrder: number;
  active: boolean;
}

export interface UpdateQuestionTypeRequest {
  displayName: string;
  shortName: string;
  displayOrder: number;
  active: boolean;
  requiresAudioPrompt: boolean;
  requiresImagePrompt: boolean;
  requiresPromptText: boolean;
  requiresOptions: boolean;
  requiresCorrectAnswer: boolean;
  requiresWordCount: boolean;
  requiresSingleCorrectOption: boolean;
  usesOptionOrderAsCorrectPosition: boolean;
}
