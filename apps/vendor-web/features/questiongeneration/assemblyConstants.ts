/** How long one finished piece takes to fly from the form into the exam screen. */
export const PIECE_FLY_MS = 900;
/** Pause between two pieces flying, so each drop can be followed by eye. */
export const PIECE_GAP_MS = 250;
/** Share of the remaining distance the agent cursor covers each frame (smooth follow). */
export const CURSOR_EASE = 0.18;

const ASSEMBLY_TEXT_EN = {
  infoTitle: "Question information",
  classification: "Classification",
  taskType: "Task type",
  section: "Section",
  contentTitle: "Content",
  promptLabel: "Prompt text",
  audioLabel: "Audio prompt",
  imageLabel: "Image prompt",
  optionsTitle: "Options",
  answerTitle: "Answer key",
  referenceLabel: "Reference answer",
  transcriptLabel: "Audio transcript",
  waitingFor: "Waiting for {agent}…",
  placing: "Placing on the exam screen…",
  placed: "On the exam screen",
  checked: "Reviewed",
  stepsToggle: "Step details",
  aiWriting: "AI is writing",
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
    optionsTitle: "Phương án",
    answerTitle: "Đáp án",
    referenceLabel: "Đáp án tham khảo",
    transcriptLabel: "Lời thoại audio",
    waitingFor: "Chờ {agent}…",
    placing: "Đang ghép vào màn thi…",
    placed: "Đã ghép vào màn thi",
    checked: "Đã duyệt",
    stepsToggle: "Chi tiết các bước",
    aiWriting: "AI đang tạo",
  },
};
