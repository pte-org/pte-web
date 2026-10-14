export type QuestionSkill = "listening" | "reading" | "writing" | "speaking";

export type QuestionStatus = "draft" | "pending_approval" | "published" | "archived";

export type QuestionPool = "exam" | "practice";

export interface Question {
  id: string;
  skill: QuestionSkill;
  taskType: string;
  content: string;
  status: QuestionStatus;
  pool: QuestionPool;
  rejectionReason?: string | null;
  canDeleteDraft?: boolean;
  canArchive?: boolean;
  deleteBlockReason?: string | null;
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
export type QuestionStatusFilter = QuestionStatus | "all";

export interface QuestionFilter {
  query: string;
  skill: QuestionSkillFilter;
  status: QuestionStatusFilter;
}
