import type { AboutPteExtras } from "./aboutPteExtras.en";

export const ABOUT_PTE_EXTRAS_VI: AboutPteExtras = {
  differences: {
    pill: "Vì sao PTE khác biệt",
    title: "4 điểm làm PTE khác với các bài thi còn lại",
    intro: "Những điều thí sinh nhận ra đầu tiên khi chuyển từ IELTS hoặc TOEFL sang PTE.",
    pteLabel: "PTE",
    cards: [
      {
        metric: "AI",
        title: "Chấm bằng AI",
        pte: "Speaking thu âm qua micro và do AI chấm, theo cùng một bộ tiêu chí cho mọi thí sinh.",
        other: [{ test: "IELTS", text: "giám khảo chấm trực tiếp." }, { test: "TOEFL", text: "AI kết hợp người chấm." }],
      },
      {
        metric: "~2 ngày",
        title: "Kết quả nhanh",
        pte: "Thường trong khoảng 2 ngày, kịp tiến độ nộp hồ sơ du học hoặc visa.",
        other: [{ test: "IELTS", text: "vài ngày đến khoảng 2 tuần." }, { test: "TOEFL", text: "khoảng 3 ngày." }],
      },
      {
        metric: "2 kỹ năng",
        title: "Một câu, hai kỹ năng",
        pte: "Một số dạng cộng điểm cho 2 kỹ năng cùng lúc, như Repeat Sentence (Speaking + Listening) hay Write from Dictation (Writing + Listening).",
        other: [{ test: "IELTS", text: "mỗi phần thi chỉ tính cho một kỹ năng." }],
      },
      {
        metric: "10–90",
        title: "Thang điểm chi tiết",
        pte: "Nhích từng 1 điểm nên dễ thấy tiến bộ nhỏ, cả điểm Overall lẫn 4 kỹ năng.",
        other: [{ test: "IELTS", text: "band 0–9, mỗi nấc 0,5." }, { test: "TOEFL", text: "thang 1–6." }],
      },
    ],
  },
  compareFilter: {
    label: "So sánh PTE với",
    all: "Tất cả bài thi",
    ielts: "PTE và IELTS",
    toefl: "PTE và TOEFL",
  },
  nav: {
    label: "Trong trang này",
    items: [
      { id: "overview", label: "Tổng quan" },
      { id: "difference", label: "Điểm khác biệt" },
      { id: "comparison", label: "So sánh" },
      { id: "vietnam", label: "Tại Việt Nam" },
      { id: "basics", label: "Dạng câu hỏi" },
      { id: "scoring", label: "Cách chấm điểm" },
      { id: "simulation", label: "Giả lập điểm" },
      { id: "sources", label: "Nguồn" },
    ],
    tryLab: "Thử giả lập điểm",
  },
  conversion: {
    title: "Điểm PTE của tôi tương đương bao nhiêu?",
    intro: "Kéo thanh trượt để đối chiếu điểm PTE Academic với IELTS và CEFR, theo bảng Pearson công bố.",
    sliderLabel: "Điểm PTE",
    pte: "PTE Academic",
    ielts: "IELTS Academic",
    cefr: "CEFR",
    belowIelts: "Dưới 4.5",
    note: "Chỉ mang tính tham khảo. Mỗi trường hoặc chương trình visa tự quy định bài thi được chấp nhận và điểm tối thiểu, hãy luôn kiểm tra yêu cầu của họ.",
  },
  labPresets: {
    label: "Bắt đầu nhanh",
    target: (score, level) => `Mục tiêu ${score} · ${level}`,
  },
  sources: {
    show: (count) => `Xem ${count} nguồn tham khảo`,
    hide: "Ẩn nguồn tham khảo",
    link: (count) => `Nguồn đối chiếu (${count})`,
  },
  cta: {
    title: "Sẵn sàng triển khai luyện thi PTE cho trung tâm của bạn?",
    text: "Đăng ký tổ chức, chờ duyệt, rồi chọn gói phù hợp với kỳ thi sắp tới của bạn.",
    register: "Đăng ký trung tâm",
    login: "Đăng nhập",
  },
};
