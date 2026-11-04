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
  /** When the question last changed (ISO 8601). */
  updatedAt?: string;
  /** CEFR level the question is written for; null until classified. */
  cefrLevel?: string | null;
  /** Who wrote the question; resolved to a name from the platform user directory. */
  authorId?: string | null;
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

/** Preparation and answer time a task type gets in an exam template. */
export interface PreviewTiming {
  prepSeconds: number;
  responseSeconds: number;
}

/** What the question form holds, as the student's exam screen needs it. */
export interface QuestionPreviewDraft {
  taskType: string;
  /** Task-type name and section, as the exam header shows them. */
  taskName: string;
  section: string;
  instruction: string | null;
  promptText: string;
  options: string[];
  /** Several options can be ticked, instead of one. */
  multipleChoice: boolean;
  /** The answer is typed text with a word counter. */
  needsWordCount: boolean;
  minWordCount: number | null;
  maxWordCount: number | null;
  /** The task type takes an uploaded image / audio, so the slot shows even while empty. */
  expectsImage: boolean;
  expectsAudio: boolean;
  imageUrl: string | null;
  audioUrl: string | null;
}
