export type QuestionSkill = "listening" | "reading" | "writing" | "speaking";

export type QuestionDifficulty = "A1" | "A2" | "B1" | "B2" | "C";

export type QuestionStatus = "draft" | "pending_approval" | "published" | "archived";

export interface Question {
  id: string;
  skill: QuestionSkill;
  taskType: string;
  content: string;
  /** null until the backend actually has a difficulty concept — see api.ts's mapQuestion. */
  difficulty: QuestionDifficulty | null;
  /** null until QuestionResponse exposes createdAt — see api.ts's mapQuestion. */
  createdAt: string | null;
  status: QuestionStatus;
  rejectionReason?: string | null;
}

export interface QuestionStats {
  total: string;
  totalTrend: string;
  listening: string;
  listeningNote: string;
  reading: string;
  readingNote: string;
  writing: string;
  writingNote: string;
  speaking: string;
  speakingNote: string;
  draft: string;
  draftNote: string;
}

export type QuestionSkillFilter = QuestionSkill | "all";
export type QuestionDifficultyFilter = QuestionDifficulty | "all";
export type QuestionStatusFilter = QuestionStatus | "all";

export interface QuestionFilter {
  query: string;
  skill: QuestionSkillFilter;
  difficulty: QuestionDifficultyFilter;
  status: QuestionStatusFilter;
}
