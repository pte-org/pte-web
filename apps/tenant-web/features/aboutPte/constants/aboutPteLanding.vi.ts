import type { AboutPteLanding } from "./aboutPteLanding.en";

export const ABOUT_PTE_LANDING_VI: AboutPteLanding = {
  hero: {
    pill: "Giải thích PTE Academic",
    title: "Hiểu về PTE.",
    titleAccent: "Thấy rõ cách chấm điểm.",
    description:
      "Tìm hiểu cấu trúc bài thi, 22 dạng câu hỏi và quy tắc chấm điểm, rồi tự thử chấm điểm với phòng thí nghiệm tương tác.",
    explore: "Khám phá PTE",
    tryLab: "Thử chấm điểm",
    resultTitle: "Bảng điểm mẫu",
    resultNote: "PTE Academic",
  },
  glance: {
    pill: "Tổng quan PTE",
    title: "PTE trong một cái nhìn",
    stats: [
      { value: "22", label: "Dạng câu hỏi" },
      { value: "10–90", label: "Thang điểm" },
      { value: "~2 giờ", label: "Thời gian thi" },
      { value: "4", label: "Kỹ năng chấm điểm" },
    ],
    conceptsTitle: "4 điều cần biết trước",
  },
  types: {
    pill: "22 dạng câu hỏi",
    title: "Khám phá đủ 22 dạng câu hỏi",
    intro: "Chia theo 3 phần thi. Dạng tích hợp được tính điểm cho hai kỹ năng.",
    showDetails: "Thí sinh làm gì ở từng dạng",
    hideDetails: "Ẩn mô tả",
  },
  scoring: {
    pill: "Hệ thống chấm điểm",
    title: "Câu trả lời trở thành điểm như thế nào?",
    steps: [
      { title: "Câu trả lời", text: "Bài nói, bài viết, hoặc các lựa chọn đã chọn." },
      { title: "Chấm tiêu chí", text: "Các tiêu chí như Content, Pronunciation, Fluency — hoặc đếm số ý đúng." },
      { title: "Điểm câu 0–100", text: "Điểm đạt ÷ điểm tối đa × 100, có cổng điểm 0 của Content/Form." },
      { title: "Kỹ năng & Overall 10–90", text: "Nhân trọng số theo dạng câu rồi quy đổi ra 10–90." },
    ],
    exampleTitle: "Ví dụ · Describe Image",
    exampleNote: "Ví dụ trong Score Guide tr. 8",
    exampleResult: "Điểm câu",
    rules: "Quy tắc chấm của từng dạng câu",
    technical: "Chi tiết 4 tầng tính điểm và trọng số kỹ năng",
  },
  simulator: {
    pill: "Demo tương tác",
    title: "Mô phỏng chấm điểm",
    text: "Chỉnh câu trả lời của từng dạng câu và xem điểm kỹ năng, điểm Overall thay đổi ngay lập tức.",
  },
  compare: {
    pill: "So sánh chứng chỉ",
    title: "PTE vs IELTS vs TOEFL",
    intro: "PTE khác các bài thi tiếng Anh phổ biến khác ở điểm nào.",
    groups: [
      { label: "Mục đích", rows: [1, 2] },
      { label: "Bài thi", rows: [3, 4, 6] },
      { label: "Điểm & kết quả", rows: [5, 7, 8] },
    ],
  },
  vietnam: {
    pill: "PTE tại Việt Nam",
    intro: "Các thành phố có điểm thi PTE được ủy quyền, theo các nguồn đã dẫn. Rê chuột vào một thành phố để xem vị trí trên bản đồ.",
    cities: ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"],
    cityNotes: ["Nhiều điểm thi, thi quanh năm", "Nhiều điểm thi, thi quanh năm", "Ít điểm thi hơn", "Ít điểm thi hơn"],
    map: { title: "Bản đồ minh họa, không theo tỉ lệ khảo sát", sea: "Biển Đông", hoangSa: "QĐ. Hoàng Sa", truongSa: "QĐ. Trường Sa" },
  },
  background: {
    pill: "Lịch sử & công nhận",
    title: "PTE ra đời thế nào và được công nhận ở đâu",
  },
  sources: { pill: "Tài liệu tham khảo" },
  showMore: "Xem",
  showLess: "Ẩn",
};
