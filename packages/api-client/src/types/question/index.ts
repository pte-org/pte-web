import type { AssetResponse } from "../asset";

export type Skill =
  | "GRAMMAR"
  | "VOCABULARY"
  | "LISTENING"
  | "READING"
  | "WRITING"
  | "SPEAKING";

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_BLANK"
  | "MATCHING"
  | "DRAG_DROP"
  | "TEXT_INPUT"
  | "AUDIO_RECORD";

export type DifficultyLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export type QuestionStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface QuestionPayload {
  skill: Skill;
  part: number;
  questionType: QuestionType;
  content: string;
  instruction?: string;
  scoreWeight?: number;
  explanation?: string;
  timeLimit?: number;
  prepTime?: number;
  maxPlayCount?: number;
  assetIds?: string[];
  difficultyLevel: DifficultyLevel;
  topicTags?: string[];
  options?: string[];
  correctAnswers?: string[];
}

export type CreateQuestionRequest = QuestionPayload;
export type UpdateQuestionRequest = QuestionPayload;

export interface QuestionResponse extends QuestionPayload {
  id: string;
  version: number;
  parentId: number | null;
  isCurrent: boolean;
  isImmutable: boolean;
  assets: AssetResponse[];
  status: QuestionStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFilters {
  skill?: Skill;
  part?: number;
  questionType?: QuestionType;
  difficultyLevel?: DifficultyLevel;
  status?: QuestionStatus;
  isCurrent?: boolean;
  page?: number;
  size?: number;
}
