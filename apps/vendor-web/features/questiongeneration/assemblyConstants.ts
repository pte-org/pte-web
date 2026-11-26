/** How long one finished piece takes to fly from the form into the exam screen. */
export const PIECE_FLY_MS = 2200;
/** Pause between two pieces flying, so each drop can be followed by eye. */
export const PIECE_GAP_MS = 1000;
/** How long the exam screen stays highlighted after a piece lands, so the eye catches where it went. */
export const PIECE_SETTLE_MS = 1500;
/** Share of the remaining distance the agent cursor covers each frame: low, so it glides rather than jumps. */
export const CURSOR_EASE = 0.08;
/** Reading sweep of the cursor: across a line (radians per second) and down the field (fields per second). */
export const SWEEP_SPEED = 1.1;
export const READ_SPEED = 0.14;
/** Margin the sweep keeps from the field's sides (share of width) and from its top and bottom (px). */
export const EDGE = 0.12;
export const EDGE_PX = 18;
/** The cursor's click: a ring that grows and fades when it ticks a check. */
export const CLICK_RIPPLE_MS = 550;
/** How often the working animations (sound wave, chart, timer) move on. */
export const ACTIVITY_TICK_MS = 260;
/**
 * Media takes an unknown time, so its drawing fills towards the end without reaching it: after this many seconds it is
 * about two thirds drawn, and it only completes when the audio or chart arrives.
 */
export const MEDIA_FILL_SECONDS = 15;
export const MEDIA_FILL_CAP = 0.95;
/** A step with nothing to type (the prompt, a check, a verdict, media without a chart) is shown this long before the next. */
export const STEP_DWELL_MS = 500;
/** The real image, once it arrives, is revealed left to right over this long before it is placed. */
export const CHART_REPLAY_MS = 3000;
/** How much of an agent's train of thought is kept (as the server does) and how much of its end is shown. */
export const THINKING_TAIL_CHARS = 2000;
export const THINKING_VISIBLE_CHARS = 600;
/** While the writer waits for the model, its cursor reads the brief it sent: one line or topic this often. */
export const BRIEF_STEP_MS = 1400;
/**
 * Thoughts are only shown scrolling once they have kept coming for this long: a provider that holds its answer back
 * sends thousands of characters of thinking in one burst just before the answer, which would flash for an instant.
 */
export const THINKING_REVEAL_AFTER_MS = 1500;
/** Bars of the sound wave drawn while Kokoro reads. */
export const WAVE_BARS = 40;

const ASSEMBLY_TEXT_EN = {
  infoTitle: "Question information",
  classification: "Classification",
  taskType: "Task type",
  section: "Section",
  contentTitle: "Content",
  promptLabel: "Prompt text",
  audioLabel: "Audio prompt",
  imageLabel: "Image prompt",
  visualLabel: "Image data",
  optionsTitle: "Options",
  answerTitle: "Answer key",
  referenceLabel: "Reference answer",
  transcriptLabel: "Audio transcript",
  hintTitle: "Answer hints",
  hintViLabel: "Answer hint (Vietnamese)",
  hintEnLabel: "Answer hint (English)",
  waitingFor: "Waiting for {agent}…",
  placing: "Placing on the exam screen…",
  placed: "On the exam screen",
  checked: "Reviewed",
  aiWriting: "AI is writing",
  validating: "Checking the structure",
  reviewing: "Scoring against the criteria",
  ttsReading: "Kokoro TTS · reading",
  chartDrawing: "Chart · drawing",
  elapsed: "Running for",
  seconds: "{s} s",
  bars: "Bars",
  chartTypeLabel: "Type",
  seriesLabel: "Series",
  imageDrawing: "Image · drawing",
  check: "Check",
  checking: "…",
  stepPrompt: "Prompt",
  stepWrite: "Write",
  stepValidate: "Check",
  stepReview: "Review",
  stepMedia: "Media",
  stepAssemble: "Exam screen",
  stepSave: "Save",
  round: "R{n}",
  sentBack: "Sent back to the writer",
  closeDetail: "Close",
  notReached: "Not reached yet",
  placedPieces: "Placed",
  verdictFix: "To fix",
  thinkingNow: "Thinking",
  thinkingStats: "· {s} s · {n} characters",
  thoughtDone: "Thought it through · {n} characters",
  avoidTopics: "Topics to avoid",
  awaitingModel: "Brief sent · waiting for the model's answer · {s} s",
} as const;

export type AssemblyText = { [K in keyof typeof ASSEMBLY_TEXT_EN]: string };

export const ASSEMBLY_TEXT: { vi: AssemblyText; en: AssemblyText } = {
  en: ASSEMBLY_TEXT_EN,
  vi: {
    infoTitle: "Thông tin câu hỏi",
    classification: "Phân loại",
    taskType: "Dạng bài",
    section: "Phần thi",
    contentTitle: "Nội dung",
    promptLabel: "Nội dung đề bài",
    audioLabel: "Âm thanh đề bài",
    imageLabel: "Hình ảnh đề bài",
    visualLabel: "Dữ liệu hình",
    optionsTitle: "Phương án",
    answerTitle: "Đáp án",
    referenceLabel: "Đáp án tham khảo",
    transcriptLabel: "Lời thoại audio",
    hintTitle: "Gợi ý trả lời",
    hintViLabel: "Gợi ý trả lời (tiếng Việt)",
    hintEnLabel: "Gợi ý trả lời (tiếng Anh)",
    waitingFor: "Chờ {agent}…",
    placing: "Đang ghép vào màn thi…",
    placed: "Đã ghép vào màn thi",
    checked: "Đã duyệt",
    aiWriting: "AI đang tạo",
    validating: "Đang kiểm tra cấu trúc",
    reviewing: "Đang chấm theo tiêu chí",
    ttsReading: "Kokoro TTS · đang đọc",
    chartDrawing: "Chart · đang vẽ biểu đồ",
    elapsed: "Đã chạy",
    seconds: "{s} giây",
    bars: "Số cột",
    chartTypeLabel: "Loại",
    seriesLabel: "Số dãy",
    imageDrawing: "Hình ảnh · đang vẽ",
    check: "Kiểm tra",
    checking: "…",
    stepPrompt: "Ghép prompt",
    stepWrite: "Viết đề",
    stepValidate: "Kiểm tra",
    stepReview: "Review",
    stepMedia: "Tạo media",
    stepAssemble: "Ghép màn thi",
    stepSave: "Lưu",
    round: "V{n}",
    sentBack: "Bị trả về viết lại",
    closeDetail: "Đóng",
    notReached: "Chưa tới bước này",
    placedPieces: "Đã ghép",
    verdictFix: "Cần sửa",
    thinkingNow: "Đang suy nghĩ",
    thinkingStats: "· {s} giây · {n} ký tự",
    thoughtDone: "Đã suy nghĩ · {n} ký tự",
    avoidTopics: "Chủ đề cần tránh",
    awaitingModel: "Đã gửi yêu cầu · đang chờ AI trả lời · {s} giây",
  },
};
