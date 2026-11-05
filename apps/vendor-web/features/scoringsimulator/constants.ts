export const SIMULATOR_CONFIG = {
  path: "/admin/scoring-simulator",
  debounceMs: 350,
  initialWordCount: 60,
  maxWordCount: 600,
  maxPassageWords: 150,
  formKey: "FORM",
} as const;

export const SIMULATOR_TEXT = {
  vi: {
    title: "Mô phỏng chấm", task: "Dạng bài", version: "Phiên bản rubric", active: "Đang hiệu lực",
    example: "Dùng ví dụ trong Score Guide", words: "Số từ", sentences: "Số câu", passage: "Số từ đoạn đọc (N)",
    caps: "Toàn chữ hoa", punctuation: "Có dấu câu", bullets: "Chỉ gạch đầu dòng", error: "Không thể mô phỏng với đầu vào này.",
    score: "Điểm câu", raw: "Trước làm tròn", form: "Band Form", contribution: "Đóng góp (trọng số × đạt / tối đa)",
    trait: "Tiêu chí", achieved: "Đạt / tối đa", weight: "Trọng số hiệu lực", gate: "Điểm câu = 0 vì điều kiện chặn: ",
    pending: "Đang cập nhật kết quả…", empty: "Chọn điểm tiêu chí để xem vết tính từ server.",
  },
  en: {
    title: "Scoring simulator", task: "Task type", version: "Rubric version", active: "Active",
    example: "Use a Score Guide example", words: "Word count", sentences: "Sentence count", passage: "Passage word count (N)",
    caps: "All capitals", punctuation: "Has punctuation", bullets: "Bullet points only", error: "Cannot simulate these inputs.",
    score: "Item score", raw: "Before rounding", form: "Form band", contribution: "Contribution (weight × achieved / max)",
    trait: "Trait", achieved: "Achieved / maximum", weight: "Effective weight", gate: "Item score = 0 because of gate: ",
    pending: "Updating result…", empty: "Select trait scores to view the server trace.",
  },
} as const;
