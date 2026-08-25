import type { BadgeVariant } from "@pte/ui";
import type {
  QuestionDifficulty,
  QuestionDifficultyFilter,
  QuestionSkill,
  QuestionSkillFilter,
  QuestionStatus,
  QuestionStatusFilter,
} from "./types";

export const QUESTIONBANK_TEXT = {
  TITLE: "Question Bank",
  SUBTITLE: "Manage and update the PTE question database.",
  ADD: "Add question",
  SEARCH_PLACEHOLDER: "Enter a code or question content...",
  STAT_TOTAL: "Total questions",
  STAT_LISTENING: "Listening",
  STAT_READING: "Reading",
  STAT_DRAFT: "Draft",
  ROW_EDIT: "Edit",
  ROW_DELETE: "Delete",
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
  in_use: "In use",
  draft: "Draft",
};

export const QUESTION_STATUS_VARIANT: Record<QuestionStatus, BadgeVariant> = {
  in_use: "success",
  draft: "warning",
};

export const QUESTION_DIFFICULTY_VARIANT: Record<
  QuestionDifficulty,
  BadgeVariant
> = {
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
  { value: "in_use", label: "In use" },
  { value: "draft", label: "Draft" },
];
