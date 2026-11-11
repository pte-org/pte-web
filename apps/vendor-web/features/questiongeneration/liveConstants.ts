import type { QuestionGenerationItemStage, QuestionGenerationJobStatus } from "@pte/api-client";

/** The page where a job is followed while the agents write. */
/** How long the finished run stays on screen before its question goes back to the form. */
export const FORM_RETURN_PAUSE_MS = 1500;
/** The new-question form, filled with what a form-started job wrote. */
export const formFillHref = (jobId: string): string => `/admin/questions/new?fromJob=${jobId}`;
/** A Describe Image picture the image model could not paint; the person may make it as a chart instead. */
export const IMAGE_FAILED_CODE = "GENERATION_IMAGE_FAILED";
export const generationLiveHref = (jobId: string): string => `/admin/questions/ai-generation/${jobId}`;
/** The page where the drafts of a finished job are reviewed. */
export const generationReviewHref = (jobId: string): string => `/admin/questions/ai-review?job=${jobId}`;
export const questionDetailHref = (questionId: string): string => `/admin/questions/${questionId}`;

/** A stream that closed while the job still runs is opened again after this pause. */
export const LIVE_RECONNECT_DELAY_MS = 2000;
/** How often the job (counts, outcomes) is reloaded while it runs; the text itself comes from the stream. */
export const LIVE_JOB_REFRESH_MS = 3000;
/** How often the header indicator looks for a running job, and how often while one runs. */
export const ACTIVITY_IDLE_POLL_MS = 15000;
export const ACTIVITY_BUSY_POLL_MS = 4000;
export const ACTIVITY_JOB_PAGE_SIZE = 5;

/** Typing: at least this many characters a frame, and the backlog is cleared in about this many frames. */
export const TYPING_MIN_CHARS_PER_FRAME = 2;
export const TYPING_CATCH_UP_FRAMES = 40;

export const TERMINAL_JOB_STATUSES: readonly QuestionGenerationJobStatus[] = ["COMPLETED", "FAILED", "CANCELLED"];
export const ACTIVE_JOB_STATUSES: readonly QuestionGenerationJobStatus[] = ["QUEUED", "RUNNING", "CANCELLING"];
export const TERMINAL_ITEM_STAGES: readonly string[] = ["READY", "SAVED", "FAILED", "CANCELLED"];

/** The steps of one item, each done by its own agent, in the order they run. */
export type LiveLane = "GENERATOR" | "REVIEWER" | "AUDIO" | "IMAGE" | "SAVE";
export type LaneStatus = "waiting" | "active" | "done" | "failed";

const LIVE_TEXT_EN = {
  title: "AI question generation",
  items: "Questions",
  item: "Question",
  progress: "{done}/{total} done",
  failedCount: "{count} failed",
  cancel: "Stop generating",
  cancelTitle: "Stop this generation?",
  cancelBody: "The question being written is dropped; the questions already saved stay in the bank.",
  cancelConfirm: "Stop",
  cancelBack: "Keep going",
  openQuestion: "Open the question",
  attempt: "Attempt {n}",
  connecting: "Connecting to the agents…",
  reconnecting: "Connection lost, reconnecting…",
  noText: "Nothing written yet.",
  noLiveText: "This question was made before this page was opened; open it in the bank to read it.",
  imageFallbackTitle: "The AI could not make the picture",
  imageFallbackBody: "The image model could not paint the picture for {count} Describe Image question(s). Make them as charts instead, with the same topic and level?",
  imageFallbackConfirm: "Make charts",
  imageFallbackCancel: "Not now",
  imageFallbackError: "The chart questions could not be started.",
  jobLoadError: "The generation could not be loaded.",
  verdictPass: "Approved",
  verdictFail: "Rejected",
  fixSuggestion: "What to fix",
  estimated: "estimated",
  saved: "Saved to the bank as a draft.",
  failed: "This question was not saved.",
  cancelledItem: "Stopped before it was made.",
  mediaAudio: "Reading the text aloud…",
  mediaImage: "Drawing the chart…",
  topic: "Topic",
  activity: "AI is writing questions",
  activityProgress: "{done}/{total}",
} as const;

export type LiveText = { [K in keyof typeof LIVE_TEXT_EN]: string };

export const LIVE_TEXT: { vi: LiveText; en: LiveText } = {
  en: LIVE_TEXT_EN,
  vi: {
    title: "Sinh đề bằng AI",
    items: "Câu hỏi",
    item: "Câu",
    progress: "Xong {done}/{total}",
    failedCount: "{count} câu lỗi",
    cancel: "Dừng sinh đề",
    cancelTitle: "Dừng lần sinh đề này?",
    cancelBody: "Câu đang viết sẽ bị bỏ; các câu đã lưu vẫn ở trong ngân hàng.",
    cancelConfirm: "Dừng",
    cancelBack: "Tiếp tục",
    openQuestion: "Mở câu hỏi",
    attempt: "Lần {n}",
    connecting: "Đang kết nối tới các agent…",
    reconnecting: "Mất kết nối, đang nối lại…",
    noText: "Chưa viết gì.",
    noLiveText: "Câu này được tạo trước khi mở trang; mở trong ngân hàng để xem nội dung.",
    imageFallbackTitle: "AI không tạo được ảnh",
    imageFallbackBody: "Model tạo ảnh không vẽ được ảnh cho {count} câu Describe Image. Bạn có muốn tạo các câu này dưới dạng biểu đồ, cùng chủ đề và trình độ không?",
    imageFallbackConfirm: "Tạo biểu đồ",
    imageFallbackCancel: "Để sau",
    imageFallbackError: "Không bắt đầu tạo câu biểu đồ được.",
    jobLoadError: "Không tải được lần sinh đề này.",
    verdictPass: "Đạt",
    verdictFail: "Không đạt",
    fixSuggestion: "Cần sửa",
    estimated: "ước tính",
    saved: "Đã lưu vào ngân hàng dưới dạng bản nháp.",
    failed: "Câu này không được lưu.",
    cancelledItem: "Đã dừng trước khi tạo.",
    mediaAudio: "Đang đọc thành tiếng…",
    mediaImage: "Đang vẽ biểu đồ…",
    topic: "Chủ đề",
    activity: "AI đang sinh đề",
    activityProgress: "{done}/{total}",
  },
};

export const LANE_LABELS: { vi: Record<LiveLane, string>; en: Record<LiveLane, string> } = {
  vi: { GENERATOR: "Sinh đề · LLM", REVIEWER: "Review · LLM", AUDIO: "Kokoro TTS", IMAGE: "Vẽ biểu đồ", SAVE: "Lưu vào ngân hàng" },
  en: { GENERATOR: "Writer · LLM", REVIEWER: "Reviewer · LLM", AUDIO: "Kokoro TTS", IMAGE: "Chart renderer", SAVE: "Save to the bank" },
};

export const STAGE_LABELS: {
  vi: Record<QuestionGenerationItemStage, string>;
  en: Record<QuestionGenerationItemStage, string>;
} = {
  vi: {
    QUEUED: "Đang chờ", GENERATING: "Đang viết đề", VALIDATING: "Đang kiểm tra", REVIEWING: "Đang review",
    RENDERING_MEDIA: "Đang tạo media", READY: "Đã soạn xong", SAVED: "Đã lưu", FAILED: "Lỗi", CANCELLED: "Đã dừng",
  },
  en: {
    QUEUED: "Waiting", GENERATING: "Writing", VALIDATING: "Checking", REVIEWING: "Reviewing",
    RENDERING_MEDIA: "Making media", READY: "Written", SAVED: "Saved", FAILED: "Failed", CANCELLED: "Stopped",
  },
};

/** Labels of the fields the generator writes (the keys of its JSON); an unknown key is shown as it is. */
export const DRAFT_FIELD_LABELS: { vi: Record<string, string>; en: Record<string, string> } = {
  vi: {
    topic: "Chủ đề", passage: "Đoạn văn", question: "Câu hỏi", options: "Phương án", correctIndexes: "Đáp án đúng",
    passageWithSlots: "Đoạn văn có chỗ trống", slots: "Chỗ trống", paragraphs: "Các đoạn", keyPoints: "Ý chính",
    essayPrompt: "Đề bài", transcript: "Lời đọc", blanks: "Chỗ trống", answer: "Đáp án", displayedText: "Văn bản hiển thị",
    changedIndexes: "Vị trí từ bị đổi", situation: "Tình huống", turns: "Lượt thoại", chartType: "Loại biểu đồ",
    title: "Tiêu đề", xLabel: "Trục X", yLabel: "Trục Y", unit: "Đơn vị", categories: "Nhóm", series: "Số liệu",
    distractors: "Phương án nhiễu", speaker: "Người nói", text: "Nội dung", name: "Tên", values: "Giá trị",
    kind: "Loại", reference: "Tham chiếu",
  },
  en: {
    topic: "Topic", passage: "Passage", question: "Question", options: "Options", correctIndexes: "Correct answers",
    passageWithSlots: "Passage with blanks", slots: "Blanks", paragraphs: "Paragraphs", keyPoints: "Key points",
    essayPrompt: "Prompt", transcript: "Transcript", blanks: "Blanks", answer: "Answer", displayedText: "Displayed text",
    changedIndexes: "Changed word positions", situation: "Situation", turns: "Turns", chartType: "Chart type",
    title: "Title", xLabel: "X axis", yLabel: "Y axis", unit: "Unit", categories: "Categories", series: "Series",
    distractors: "Distractors", speaker: "Speaker", text: "Text", name: "Name", values: "Values",
    kind: "Kind", reference: "Reference",
  },
};

/** Labels of the reviewer's checks (the keys of its `checks` object). */
export const REVIEW_CHECK_LABELS: { vi: Record<string, string>; en: Record<string, string> } = {
  vi: {
    taskFidelity: "Đúng dạng bài", cefrFit: "Đúng trình độ CEFR", answerKey: "Đáp án rõ ràng",
    scorability: "Chấm được", clarity: "Dễ hiểu", safety: "An toàn",
  },
  en: {
    taskFidelity: "Fits the task type", cefrFit: "Fits the CEFR level", answerKey: "Clear answer key",
    scorability: "Can be scored", clarity: "Clear wording", safety: "Safe content",
  },
};



