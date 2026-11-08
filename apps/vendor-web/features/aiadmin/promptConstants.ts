import type { PromptCategory } from "@pte/api-client";

export const PROMPT_CATEGORIES: readonly PromptCategory[] = ["GENERATION", "REVIEW", "SCORING", "SHARED", "CHATBOT"];
export const PROMPT_TABS_ID = "ai-prompt-category-tabs";
export const PROMPT_QUERY_KEY = ["ai-admin", "prompt-catalog"] as const;

export const promptDetailHref = (category: PromptCategory, key: string): string =>
  `/admin/ai/prompts/${encodeURIComponent(category)}/${encodeURIComponent(key)}`;

const COPY_EN = {
  TITLE: "AI prompts",
  CATEGORY_GENERATION: "Question generation",
  CATEGORY_REVIEW: "Question review",
  CATEGORY_SCORING: "Scoring",
  CATEGORY_SHARED: "Shared blocks",
  CATEGORY_CHATBOT: "Chatbot",
  COLUMN_PROMPT: "Prompt",
  COLUMN_HANDLED_BY: "Handled by",
  COLUMN_ACTIONS: "Actions",
  ACTION_VIEW: "View",
  ALL_CATEGORIES: "All prompts",
  EMPTY: "No prompts found.",
  LOADING: "Loading prompts…",
  LOAD_ERROR: "The prompts could not be loaded.",
  RETRY: "Try again",
  VERSION: "Prompt version",
  TAB_ASSEMBLED: "Text sent to the AI (advanced)",
  ASSEMBLED_EMPTY: "No prompt is sent to an AI model for this entry. It is scored by the engines listed in the first tab.",
  LOCKED: "Fixed",
  EXAMPLE_TITLE: "Example of what the AI returns",
  COLUMN_FIELD: "Information",
  COLUMN_EXAMPLE: "Example",
  FILLED_BY_SYSTEM: "Filled in by the system when a question is created",
  SENT_TO_AI: "Sent to the AI",
  REFERENCE_ONLY: "Reference only, not sent to the AI",
  LEVEL: "Level {level}",
  ENGINE_GEMINI: "Gemini",
  ENGINE_AZURE: "Azure",
  ENGINE_CODE: "Code",
  ENGINE_LLM: "LLM",
  ENGINE_TTS: "Kokoro TTS",
  ENGINE_CHART: "Chart renderer",
  BACK: "Back to prompts",
} as const;

export type PromptCopy = { [K in keyof typeof COPY_EN]: string };

const COPY_VI: PromptCopy = {
  TITLE: "Prompt của AI",
  CATEGORY_GENERATION: "Sinh đề",
  CATEGORY_REVIEW: "Review đề",
  CATEGORY_SCORING: "Chấm điểm",
  CATEGORY_SHARED: "Khối dùng chung",
  CATEGORY_CHATBOT: "Chatbot",
  COLUMN_PROMPT: "Prompt",
  COLUMN_HANDLED_BY: "Ai xử lý",
  COLUMN_ACTIONS: "Thao tác",
  ACTION_VIEW: "Xem",
  ALL_CATEGORIES: "Tất cả prompt",
  EMPTY: "Không tìm thấy prompt nào.",
  LOADING: "Đang tải prompt…",
  LOAD_ERROR: "Không tải được prompt.",
  RETRY: "Thử lại",
  VERSION: "Phiên bản prompt",
  TAB_ASSEMBLED: "Văn bản gửi AI (nâng cao)",
  ASSEMBLED_EMPTY: "Mục này không gửi prompt cho mô hình AI nào. Điểm do các bộ máy ghi ở tab đầu chấm.",
  LOCKED: "Cố định",
  EXAMPLE_TITLE: "Ví dụ kết quả AI trả về",
  COLUMN_FIELD: "Thông tin",
  COLUMN_EXAMPLE: "Ví dụ",
  FILLED_BY_SYSTEM: "Hệ thống tự điền khi tạo câu hỏi",
  SENT_TO_AI: "Gửi cho AI",
  REFERENCE_ONLY: "Chỉ tham khảo, không gửi cho AI",
  LEVEL: "Mức {level}",
  ENGINE_GEMINI: "Gemini",
  ENGINE_AZURE: "Azure",
  ENGINE_CODE: "Code",
  ENGINE_LLM: "LLM",
  ENGINE_TTS: "Kokoro TTS",
  ENGINE_CHART: "Vẽ biểu đồ",
  BACK: "Về danh sách prompt",
};

export const PROMPT_COPY = { en: COPY_EN as PromptCopy, vi: COPY_VI } as const;

/** Section titles in Vietnamese by id; an id not listed here is shown with the English title the API sends. */
export const PROMPT_SECTION_TITLES_VI: Record<string, string> = {
  intro: "Tổng quan",
  requirements: "Yêu cầu",
  "json-example": "Ví dụ kết quả",
  "json-format": "Định dạng kết quả",
  instructions: "Lưu ý khi trả kết quả",
  placeholders: "Thông tin hệ thống tự điền",
  role: "Vai trò",
  checklist: "Danh sách kiểm tra",
  judging: "Reviewer đánh giá gì",
  output: "Định dạng kết quả",
  sources: "Ai chấm từng tiêu chí",
  levels: "Mô tả mức gửi cho AI",
  notes: "AI không được chấm gì",
  guard: "Chống lệnh trong bài làm",
  reference: "Chỉ tham khảo",
  guidelines: "Nguyên tắc chung",
  context: "Ngữ cảnh",
  "validation-rules-enforced-after-generation": "Quy tắc kiểm tra sau khi sinh",
  "task-structure": "Cấu trúc dạng bài",
  "output-json-schema": "Cấu trúc kết quả",
  "example-output": "Ví dụ kết quả",
  "chart-type-rules": "Quy tắc loại biểu đồ",
};

