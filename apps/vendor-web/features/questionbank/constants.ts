import type { BadgeVariant } from "@pte/ui";
import type {
  QuestionDifficulty,
  QuestionDifficultyFilter,
  QuestionSkill,
  QuestionSkillFilter,
  QuestionStatus,
  QuestionStatusFilter,
} from "./types";

export const QUESTIONS_QUERY_KEY = ["questions"] as const;
export const QUESTION_STATS_QUERY_KEY = ["questionStats"] as const;

export const QUESTIONBANK_TEXT = {
  TITLE: "Question Bank",
  SUBTITLE: "Manage and update the PTE question database.",
  ADD: "Add question",
  SEARCH_PLACEHOLDER: "Enter a code or question content...",
  STAT_TOTAL: "Total questions",
  STAT_LISTENING: "Listening",
  STAT_READING: "Reading",
  STAT_WRITING: "Writing",
  STAT_SPEAKING: "Speaking",
  STAT_DRAFT: "Draft",
  ROW_EDIT: "Edit",
  ROW_DELETE: "Delete",
  ROW_PUBLISH: "Publish",
  ROW_ARCHIVE: "Archive",
  ROW_UNARCHIVE: "Unarchive",
} as const;

export const QUESTION_TABLE_HEADERS = {
  CODE: "Question Code",
  SKILL: "Skill",
  CONTENT: "Content",
  DIFFICULTY: "Difficulty",
  CREATED: "Created On",
  STATUS: "Status",
  ACTIONS: "Actions",
} as const;

export const QUESTION_SKILL_LABELS: Record<QuestionSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending approval",
  published: "Published",
  archived: "Archived",
};

export const QUESTION_STATUS_VARIANT: Record<QuestionStatus, BadgeVariant> = {
  draft: "warning",
  pending_approval: "info",
  published: "success",
  archived: "info",
};

export const QUESTION_DIFFICULTY_VARIANT: Record<QuestionDifficulty, BadgeVariant> = {
  A1: "info",
  A2: "info",
  B1: "info",
  B2: "warning",
  C: "danger",
};

export const SKILL_FILTER_OPTIONS: {
  value: QuestionSkillFilter;
  label: string;
}[] = [
  { value: "all", label: "All skills" },
  { value: "listening", label: "Listening" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
];

export const DIFFICULTY_FILTER_OPTIONS: {
  value: QuestionDifficultyFilter;
  label: string;
}[] = [
  { value: "all", label: "All difficulties" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C", label: "C" },
];

export const QUESTION_STATUS_FILTER_OPTIONS: {
  value: QuestionStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending approval" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];
