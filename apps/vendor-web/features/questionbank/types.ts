export type QuestionSkill = "listening" | "reading" | "writing" | "speaking";

export type QuestionDifficulty = "A1" | "A2" | "B1" | "B2" | "C";

export type QuestionStatus = "in_use" | "draft";

export interface Question {
  id: string;
  skill: QuestionSkill;
  content: string;
  difficulty: QuestionDifficulty;
  createdAt: string;
  status: QuestionStatus;
}

export interface QuestionStats {
  total: string;
  totalTrend: string;
  listening: string;
  listeningNote: string;
  reading: string;
  readingNote: string;
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
