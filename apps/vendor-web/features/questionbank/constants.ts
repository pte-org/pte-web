import type { BadgeVariant } from "@pte/ui";
import type { QuestionPool as ApiQuestionPool } from "@pte/api-client";
import type {
  QuestionPool,
  QuestionSkill,
  QuestionSkillFilter,
  QuestionStatus,
  QuestionStatusFilter,
} from "./types";

export const QUESTIONS_QUERY_KEY = ["questions"] as const;
export const QUESTION_STATS_QUERY_KEY = ["questionStats"] as const;

export const QUESTIONBANK_TEXT = {
  TITLE: "Question Bank",
  POOL_TABS_ARIA_LABEL: "Question pool",
  ADD: "Add question",
  SEARCH_PLACEHOLDER: "Search by question content...",
  TOTAL_QUESTIONS: (count: number) => `${count} questions`,
  LOAD_ERROR: "Could not load the question bank. Please try again.",
  SYNCING: "Updating question bank...",
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
  ROW_DELETE_DRAFT: "Delete draft",
  DELETE_CONFIRM_TITLE: "Delete this draft?",
  DELETE_CONFIRM_DESCRIPTION:
    "This draft will be removed from authoring. Audit history and media are retained, but it cannot be restored from this UI.",
  DELETE_SUCCESS: "Question draft deleted.",
  DELETE_BLOCKED:
    "This draft cannot be deleted because it has publication history or its history is unknown.",
  ARCHIVE_CONFIRM_TITLE: "Archive this question?",
  ARCHIVE_CONFIRM_DESCRIPTION:
    "This question will be excluded from new exam generation. Existing exam snapshots and publication history are retained.",
  ARCHIVE_CONFIRM_BUTTON: "Archive question",
  ROW_UNARCHIVE: "Unarchive",
  ROW_SUBMIT: "Submit for approval",
  ROW_APPROVE: "Approve",
  ROW_REJECT: "Reject",
  EMPTY_VALUE: "—",
  EMPTY_TITLE: "No questions found",
  EMPTY_DESCRIPTION_FILTERED: "No questions match your search or filters. Try adjusting them.",
  EMPTY_DESCRIPTION_UNFILTERED:
    "The question bank is empty. Add your first question to get started.",
  EMPTY_CLEAR_FILTERS: "Clear filters",
  REJECTION_REASON_DEFAULT: "Please revise this question.",
  REJECT_MODAL_TITLE: "Reject this question?",
  REJECT_MODAL_DESCRIPTION: "It will go back to Draft so the author can revise it.",
  REJECT_REASON_LABEL: "Reason for rejection",
  REJECT_REASON_PLACEHOLDER: "Explain what needs to change...",
  REJECT_REASON_REQUIRED: "A reason is required so the author knows what to fix.",
  REJECT_CONFIRM_BUTTON: "Reject question",
  CANCEL: "Cancel",
  STATUS_UPDATE_ERROR: "Could not update this question's status. Please try again.",
  SUBMIT_SUCCESS: "Question submitted for approval.",
  APPROVE_SUCCESS: "Question approved and published.",
  REJECT_SUCCESS: "Question rejected and sent back to draft.",
  ARCHIVE_SUCCESS: "Question archived.",
  UNARCHIVE_SUCCESS: "Question unarchived.",
} as const;

export const QUESTION_DETAIL_TEXT = {
  BACK: "← Back to Question Bank",
  BACK_TO_BANK: "Back to the question bank",
  BACK_TO_STUDIO: "Back to the Content Hub",
  EDIT: "Edit question",
  INFORMATION_TITLE: "Question information",
  GROUP_IDENTITY: "Identity",
  GROUP_CLASSIFICATION: "Classification",
  GROUP_CONTENT: "Content",
  QUESTION_CODE: "Question code",
  TASK_TYPE: "Task type",
  SECTION: "Section",
  POOL: "Question pool",
  CEFR_LEVEL: "CEFR level",
  CEFR_UNSET: "Not classified",
  REVISION: "Revision",
  REJECTION_REASON: "Rejection reason",
  MIN_WORD_COUNT: "Minimum word count",
  MAX_WORD_COUNT: "Maximum word count",
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
  OPTIONS: "Options",
  CORRECT: "Correct answer",
  REFERENCE_ANSWER: "Reference answer",
  AUDIO_TRANSCRIPT: "Audio transcript",
  CORRECT_ANSWER: "Correct answer",
  ANSWER_HINT: "Answer hints",
  ANSWER_HINT_VI: "Answer hint (Vietnamese)",
  ANSWER_HINT_EN: "Answer hint (English)",
  EMPTY_VALUE: "—",
  LOAD_ERROR: "Could not load this question. Please try again.",
  NOT_FOUND: "This question could not be found.",
  AUDIO_LABEL: "Play audio prompt",
  IMAGE_ALT: "Question image prompt",
} as const;

/** The CEFR levels a question can be written for, easiest first. */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const QUESTIONBANK_OVERVIEW_TEXT = {
  EMPTY_VALUE: "—",
} as const;

export const QUESTION_EDITOR_TEXT = {
  NEW_TITLE: "New question",
  EDIT_TITLE: "Edit question",
  FORM_EDIT_TITLE: "Edit question",
  FORM_CREATE_TITLE: "Create PTE Question",
  TASK_TYPE: "Task type",
  LOADING_TASK_TYPES: "Loading task types...",
  POOL: "Question pool",
  CEFR_LEVEL: "CEFR level",
  CEFR_UNSET: "Not classified",
  CEFR_HELPER: "Required before an exam question is submitted for approval.",
  POOL_HELPER_CREATE:
    "Exam questions can be drawn into exams; practice questions are only used for practice. This cannot be changed later.",
  POOL_HELPER_EDIT: "The pool can be changed only while the question is a draft.",
  POOL_HELPER_LOCKED:
    "The pool is locked once a question is submitted. Open a new draft revision to change it.",
  PROMPT_TEXT: "Prompt text",
  AUDIO_PROMPT: "Audio prompt",
  IMAGE_PROMPT: "Image prompt",
  UPLOADED_MEDIA: (mediaId: string) => `Uploaded media: ${mediaId}`,
  CHOOSE_FILE: "Choose file",
  REPLACE_FILE: "Replace file",
  NO_FILE: "No file chosen",
  UPLOADING: "Uploading…",
  PROMPT_PREVIEW_ALT: "Question prompt preview",
  MIN_WORD_COUNT: "Minimum word count",
  MAX_WORD_COUNT: "Maximum word count",
  REFERENCE_ANSWER: "Reference answer",
  AUDIO_TRANSCRIPT: "Audio transcript",
  CORRECT_ANSWER: "Correct answer",
  ANSWER_HINT: "Answer hints",
  ANSWER_HINT_HELPER: "Shown to students in practice on request. Explain how to approach the item; never give the answer.",
  ANSWER_HINT_VI: "Answer hint (Vietnamese)",
  ANSWER_HINT_EN: "Answer hint (English)",
  ANSWER_HINT_MAX_LENGTH: 1000,
  OPTIONS: "Options",
  CORRECT_OPTION: (index: number) => `Correct option ${index}`,
  OPTION: (index: number) => `Option ${index}`,
  REMOVE: "Remove",
  ADD_OPTION: "Add option",
  SAVE_DRAFT: "Save Draft",
  CREATE_DRAFT: "Create Draft",
  CANCEL: "Cancel",
  CREATE_SUCCESS: "Question created as a draft.",
  UNSAVED_TITLE: "Leave without saving?",
  UNSAVED_DESCRIPTION: "This question has changes that are not saved. If you leave now, they will be lost.",
  UNSAVED_STAY: "Stay on this page",
  UNSAVED_LEAVE: "Leave without saving",
  UPDATE_SUCCESS: "Question draft saved.",
} as const;

/** Format of "Correct answer text" for the task types the automatic scorers read as text. */
export const CORRECT_ANSWER_HINTS = {
  FILL_IN_THE_BLANKS_TYPE_IN:
    'A JSON list with one word per gap, in order. Example: ["London", "ecosystem"]',
  HIGHLIGHT_INCORRECT_WORDS:
    "A JSON list of the positions of the wrong words, counting from 0. Example: [3, 8, 14]",
  ANSWER_SHORT_QUESTION:
    "The accepted answers separated by /, best answer first. Example: thermometer / a thermometer",
} as const;

export const POOL_CHANGE_TEXT = {
  TO_PRACTICE_TITLE: "Move this question to Practice?",
  TO_PRACTICE_BODY:
    "Practice questions show answers and feedback to learners. Once published, this question will leave the Official pool and can no longer be drawn into exams.",
  TO_PRACTICE_RISK:
    "This question has already been published. If it was used in a real exam, moving it to Practice may leak exam content.",
  TO_OFFICIAL_TITLE: "Move this question to Official?",
  TO_OFFICIAL_BODY:
    "Once published, this question can be drawn into exams and will leave the Practice pool. Make sure it has been reviewed to exam standard.",
  CONFIRM: "Change pool",
  CANCEL: "Keep current pool",
} as const;

export const QUESTION_EDITOR_ERRORS = {
  MEDIA_UPLOAD: "Media upload failed. Please try again.",
  QUESTION_TYPES_UNAVAILABLE:
    "Task type configuration is unavailable. Please refresh and try again.",
  PROMPT_REQUIRED: "Prompt text is required for this task.",
  AUDIO_REQUIRED: "An audio prompt is required for this task.",
  IMAGE_REQUIRED: "An image prompt is required for this task.",
  WORD_COUNTS_REQUIRED: "Minimum and maximum word counts are required for this task.",
  WORD_COUNTS_INVALID:
    "Word counts must be whole numbers of 0 or more, and the minimum cannot be greater than the maximum.",
  CORRECT_ANSWER_REQUIRED: "A correct answer is required for this task.",
  INVALID_CORRECT_ANSWER_FORMAT:
    "The correct answer is not in the format this task type needs. See the hint under the field.",
  REFERENCE_ANSWER_REQUIRED:
    "This task needs its source text: the sentence to repeat, or the transcript of the audio the student retells or summarises.",
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
  SKILL: "Skill",
  CONTENT: "Content",
  TASK_TYPE: "Task type",
  POOL: "Pool",
  CEFR: "CEFR",
  SOURCE: "Source",
  STATUS: "Status",
  ACTIONS: "Actions",
} as const;

export type QuestionBankTab = "official" | "practice";

export const QUESTION_BANK_TAB_ITEMS = [
  { id: "official", label: "Official" },
  { id: "practice", label: "Practice" },
] as const;

export const QUESTION_BANK_TAB_POOLS: Record<QuestionBankTab, ApiQuestionPool> = {
  official: "EXAM",
  practice: "PRACTICE",
};

export const QUESTION_SKILL_LABELS: Record<QuestionSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export const QUESTION_POOL_LABELS: Record<QuestionPool, string> = {
  exam: "Official",
  practice: "Practice",
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
  archived: "neutral",
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
