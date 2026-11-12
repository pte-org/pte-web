/** Copy of the prompt guide: which parts of a prompt are read-only and why. */
interface PromptGuideCopy {
  BUTTON: string;
  TITLE: string;
  INTRO: string;
  LOCKED_TITLE: string;
  NO_LOCKED: string;
  OUTPUT_TITLE: string;
  OUTPUT_BODY: string;
  TOKENS_TITLE: string;
  TOKENS_BODY: string;
  TEST_TITLE: string;
  TEST_BODY: string;
  CLOSE: string;
  REASONS: Record<string, string>;
  FALLBACK_REASON: string;
}

const GUIDE_EN: PromptGuideCopy = {
  BUTTON: "Guide",
  TITLE: "Editing this prompt",
  INTRO: "Most of a prompt is free text you can rewrite. A few parts are read by code, so they can only be viewed.",
  LOCKED_TITLE: "Read-only sections",
  NO_LOCKED: "This prompt has no read-only section.",
  OUTPUT_TITLE: "Output",
  OUTPUT_BODY:
    "The program reads the AI's reply by these exact field names, so a field cannot be renamed, added or removed. "
    + "You can change the example value of a field, for example the topic.",
  TOKENS_TITLE: "Tokens the system fills in",
  TOKENS_BODY: "Words in braces such as {cefr} or {topicHint} are replaced with real values when a question is made.",
  TEST_TITLE: "Before sending for approval",
  TEST_BODY: "Save the proposal and run Test prompt; a change that makes the AI answer in the wrong form fails there.",
  CLOSE: "Close",
  REASONS: {
    instructions: "Tells the AI to answer with one JSON object in the shape the program reads. Changing it can make "
      + "every generated question fail to load.",
    context: "Holds the tokens the system fills in (level, topic, topics to avoid, length).",
    "json-format": "Keeps every reply valid JSON so the program can read it.",
    "answer-hints": "Asks for answerHintVi and answerHintEn, which every generated question must carry.",
    "student-hints": "Makes the reviewer check that the student hints do not give the answer away.",
    "image-settings": "Read by the system, not by the AI: how many times a picture is painted and what happens when "
      + "it keeps failing. Change the values only: maxImageAttempts 1 to 5, whenImageFails ASK (ask first) or CHART (make a chart at once).",
  },
  FALLBACK_REASON: "Read by the program.",
};

const GUIDE_VI: PromptGuideCopy = {
  BUTTON: "Hướng dẫn",
  TITLE: "Cách sửa prompt này",
  INTRO: "Phần lớn prompt là văn bản tự do, bạn có thể viết lại. Một số phần được code đọc trực tiếp nên chỉ được xem.",
  LOCKED_TITLE: "Các phần chỉ được xem",
  NO_LOCKED: "Prompt này không có phần nào bị khóa.",
  OUTPUT_TITLE: "Output",
  OUTPUT_BODY:
    "Hệ thống đọc câu trả lời của AI theo đúng các tên field này, nên không được đổi tên, thêm hay xóa field. "
    + "Bạn có thể đổi giá trị mẫu của field, ví dụ đổi chủ đề.",
  TOKENS_TITLE: "Thông tin hệ thống tự điền",
  TOKENS_BODY: "Các chữ trong ngoặc nhọn như {cefr}, {topicHint} được thay bằng giá trị thật khi tạo câu hỏi.",
  TEST_TITLE: "Trước khi gửi duyệt",
  TEST_BODY: "Hãy lưu đề xuất và bấm Test prompt; nếu thay đổi làm AI trả sai định dạng, test sẽ báo không đạt.",
  CLOSE: "Đóng",
  REASONS: {
    instructions: "Yêu cầu AI trả về đúng một đối tượng JSON theo dạng hệ thống đọc. Sửa phần này có thể làm mọi câu "
      + "AI tạo ra bị lỗi.",
    context: "Chứa các thông tin hệ thống tự điền (trình độ, chủ đề, chủ đề cần tránh, độ dài).",
    "json-format": "Giữ cho mọi câu trả lời là JSON hợp lệ để hệ thống đọc được.",
    "answer-hints": "Yêu cầu AI trả answerHintVi và answerHintEn, là gợi ý bắt buộc của mọi câu hỏi tạo ra.",
    "student-hints": "Bắt reviewer kiểm tra gợi ý cho học viên không lộ đáp án.",
    "image-settings": "Do hệ thống đọc, không gửi cho AI: số lần vẽ ảnh và cách xử lý khi ảnh lỗi mãi. Chỉ đổi giá "
      + "trị: maxImageAttempts từ 1 đến 5, whenImageFails là ASK (hỏi bạn trước) hoặc CHART (tự chuyển sang biểu đồ).",
  },
  FALLBACK_REASON: "Được hệ thống đọc trực tiếp.",
};

export const PROMPT_GUIDE_COPY = { en: GUIDE_EN, vi: GUIDE_VI } as const;
