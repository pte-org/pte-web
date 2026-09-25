import type { BadgeVariant } from "@pte/ui";
import type {
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
  TOTAL_QUESTIONS: (count: number) => `${count} questions`,
  LOAD_ERROR: "Could not load the question bank. Please try again.",
  SYNCING: "Updating question bank...",
  PAGE_SIZE: "Rows per page",
  FIRST_PAGE: "First",
  LAST_PAGE: "Last",
  STAT_TOTAL: "Total questions",
  STAT_LISTENING: "Listening",
  STAT_READING: "Reading",
  STAT_WRITING: "Writing",
  STAT_SPEAKING: "Speaking",
  STAT_DRAFT: "Draft",
  ROW_EDIT: "Edit",
  ROW_VIEW_DETAILS: "View details",
  ROW_DELETE: "Delete",
  ROW_PUBLISH: "Publish",
  ROW_ARCHIVE: "Archive",
  ARCHIVE_CONFIRM_TITLE: "Archive this question?",
  ARCHIVE_CONFIRM_DESCRIPTION:
    "Archived questions are hidden from exam generation and cannot be edited until unarchived.",
  ARCHIVE_CONFIRM_BUTTON: "Archive question",
  ROW_UNARCHIVE: "Unarchive",
  ROW_SUBMIT: "Submit for approval",
  ROW_APPROVE: "Approve",
  ROW_REJECT: "Reject",
  EMPTY_VALUE: "—",
  REJECTION_REASON_PROMPT: "Reason for rejection",
  REJECTION_REASON_DEFAULT: "Please revise this question.",
  STATUS_UPDATE_ERROR: "Could not update this question's status. Please try again.",
} as const;

export const QUESTION_DETAIL_TEXT = {
  BACK: "← Back to Question Bank",
  SUBTITLE: (taskType: string) => `Review the content and media attached to ${taskType}.`,
  EDIT: "Edit question",
  INFORMATION_TITLE: "Question information",
  GROUP_IDENTITY: "Identity",
  GROUP_CLASSIFICATION: "Classification",
  QUESTION_CODE: "Question code",
  TASK_TYPE: "Task type",
  SECTION: "Section",
  VISIBILITY: "Visibility",
  REVISION: "Revision",
  WORD_COUNT: "Word count",
  WORD_COUNT_RANGE: (min: number, max: number) => `${min}–${max} words`,
  PROMPT_TITLE: "Prompt",
  PROMPT_TEXT: "Prompt text",
  NO_PROMPT: "This question has no text prompt.",
  MEDIA_TITLE: "Prompt media",
  AUDIO_PROMPT: "Audio prompt",
  IMAGE_PROMPT: "Image prompt",
  MEDIA_ID: (id: string) => `Media ID: ${id}`,
  MEDIA_DURATION: (seconds: number) => `${seconds} seconds`,
  MEDIA_LOADING: "Loading media preview...",
  MEDIA_UNAVAILABLE: "The media preview could not be loaded. The media reference is still saved.",
  NO_MEDIA: "No audio or image is attached to this question.",
  ANSWERS_TITLE: "Answers",
  OPTIONS: "Options",
  CORRECT: "Correct answer",
  GROUP_ANSWER_KEY: "Answer key",
  REFERENCE_ANSWER: "Reference answer",
  CORRECT_ANSWER: "Correct answer text",
  EMPTY_VALUE: "—",
  LOAD_ERROR: "Could not load this question. Please try again.",
  NOT_FOUND: "This question could not be found.",
  AUDIO_LABEL: "Play audio prompt",
  IMAGE_ALT: "Question image prompt",
} as const;

export const QUESTIONBANK_OVERVIEW_TEXT = {
  TITLE: "Overview",
  SUBTITLE: "Question inventory at a glance.",
  EMPTY_VALUE: "—",
} as const;

export const QUESTION_EDITOR_TEXT = {
  NEW_TITLE: "New question",
  NEW_SUBTITLE: "Create a draft question for Admin approval.",
  EDIT_TITLE: "Edit question",
  EDIT_SUBTITLE: "Save changes as a draft revision.",
  FORM_EDIT_TITLE: "Edit Question Revision",
  FORM_CREATE_TITLE: "Create PTE Question",
  TASK_TYPE: "Task type",
  LOADING_TASK_TYPES: "Loading task types...",
  TITLE: "Title",
  PROMPT_TEXT: "Prompt text",
  AUDIO_PROMPT: "Audio prompt",
  IMAGE_PROMPT: "Image prompt",
  UPLOADED_MEDIA: (mediaId: string) => `Uploaded media: ${mediaId}`,
  PROMPT_PREVIEW_ALT: "Question prompt preview",
  MIN_WORD_COUNT: "Minimum word count",
  MAX_WORD_COUNT: "Maximum word count",
  REFERENCE_ANSWER: "Reference answer",
  CORRECT_ANSWER: "Correct answer",
  OPTIONS: "Options",
  CORRECT_OPTION: (index: number) => `Correct option ${index}`,
  OPTION: (index: number) => `Option ${index}`,
  REMOVE: "Remove",
  ADD_OPTION: "Add option",
  SAVE_DRAFT: "Save Draft",
  CREATE_DRAFT: "Create Draft",
  CANCEL: "Cancel",
  CREATE_SUCCESS: "Question created as a draft.",
  UPDATE_SUCCESS: "Question draft saved.",
} as const;

export const QUESTION_EDITOR_ERRORS = {
  MEDIA_UPLOAD: "Media upload failed. Please try again.",
  QUESTION_TYPES_UNAVAILABLE:
    "Task type configuration is unavailable. Please refresh and try again.",
  TITLE_REQUIRED: "Title is required.",
  PROMPT_REQUIRED: "Prompt text is required for this task.",
  AUDIO_REQUIRED: "An audio prompt is required for this task.",
  IMAGE_REQUIRED: "An image prompt is required for this task.",
  WORD_COUNTS_REQUIRED: "Minimum and maximum word counts are required for this task.",
  CORRECT_ANSWER_REQUIRED: "A correct answer is required for this task.",
  OPTION_TEXT_REQUIRED: "Every option must contain text.",
  CORRECT_OPTION_REQUIRED: "Select at least one correct option.",
  SINGLE_CORRECT_REQUIRED: "Single-choice tasks require exactly one correct option.",
  LOAD_TYPES: "Could not load task types. Please refresh.",
  SAVE: "Could not save the question. Check the required fields and try again.",
  LOAD_QUESTION: "Could not load this question.",
  CREATE_REVISION: "Could not create a draft revision for this question.",
  PENDING_APPROVAL: "This question is waiting for admin approval and cannot be edited yet.",
  ARCHIVED: "Archived questions cannot be edited.",
  STATUS_UPDATE: "Could not update this question's status. Please try again.",
  CLOUDINARY_UPLOAD: "Cloudinary upload failed",
} as const;

export const QUESTION_TABLE_HEADERS = {
  CODE: "Question Code",
  SKILL: "Skill",
  CONTENT: "Content",
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
