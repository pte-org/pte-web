import type { AboutPteCopy } from "./aboutPteCopy.en";

/** Bản tiếng Việt của trang Giới thiệu PTE. Số trong `src` là id trong ABOUT_PTE_SOURCES. */
export const ABOUT_PTE_VI: AboutPteCopy = {
  nav: "Về PTE",
  hero: {
    eyebrow: "Hiểu về kỳ thi đằng sau đồ án này",
    title: "PTE là gì và được chấm điểm ra sao?",
    description:
      "Tổng quan có dẫn nguồn về Pearson Test of English: ai tổ chức, được công nhận ở đâu, khác gì các chứng chỉ khác và nền tảng này quy đổi bài làm thành điểm 10–90 như thế nào.",
    toc: ["Tổng quan", "Lịch sử", "Công nhận", "Tại Việt Nam", "So sánh", "Luồng chấm điểm", "Giả lập", "Nguồn"],
  },
  what: {
    title: "PTE là gì",
    body: [
      "PTE (Pearson Test of English) là nhóm bài thi tiếng Anh trên máy tính do Pearson — tập đoàn giáo dục của Anh — sở hữu và tổ chức. PTE Academic là bài thi 4 kỹ năng chủ lực, dùng cho du học và định cư.",
      "PTE Academic là một bài thi duy nhất khoảng 2 giờ, gồm 3 phần — Speaking & Writing, Reading và Listening — với 22 dạng câu hỏi. Bài làm được chấm bằng hệ thống chấm tự động của Pearson, kết quả thường có trong khoảng 2 ngày.",
      "Điểm được báo trên thang 10–90: một điểm tổng (Overall) và bốn điểm kỹ năng giao tiếp (Speaking, Writing, Reading, Listening).",
    ],
    src: [1, 14],
    facts: [
      { label: "Đơn vị sở hữu", value: "Pearson plc" },
      { label: "Hình thức", value: "Trên máy tính, ~2 giờ" },
      { label: "Thang điểm", value: "10–90" },
      { label: "Trả kết quả", value: "Thường ~2 ngày" },
    ],
  },
  history: {
    title: "Lịch sử",
    items: [
      { year: "2009", text: "Pearson ra mắt PTE Academic vào cuối năm 2009, dựa trên góp ý từ các trường đại học.", src: [3] },
      { year: "2014", text: "Được chính phủ Úc chấp nhận cho mục đích thị thực (sau đó là New Zealand và Anh).", src: [4, 7] },
      { year: "2019", text: "PTE Academic tròn 10 năm tổ chức thi.", src: [4] },
      { year: "2024", text: "Ra mắt PTE Core — bài thi tiếng Anh tổng quát được IRCC chấp nhận cho định cư diện kinh tế tại Canada.", src: [5, 6] },
      { year: "2025", text: "Thêm hai dạng Speaking mới — Summarize Group Discussion và Respond to a Situation — áp dụng từ ngày 7/8/2025.", src: [2] },
    ],
  },
  recognition: {
    title: "Mức độ công nhận",
    rows: [
      { region: "Úc & New Zealand", text: "Chấp nhận cho thị thực du học, lao động và định cư; mọi trường đại học tại Úc và New Zealand đều chấp nhận PTE Academic.", src: [4, 7] },
      { region: "Vương quốc Anh", text: "Gần như mọi trường đại học tại Anh chấp nhận; PTE Academic UKVI là phiên bản SELT của Bộ Nội vụ Anh dùng cho thị thực.", src: [3, 4] },
      { region: "Canada", text: "IRCC chấp nhận PTE Core (không phải PTE Academic) cho định cư diện kinh tế và quốc tịch. Các trường tự quy định riêng.", src: [5, 6] },
      { region: "Hoa Kỳ", text: "Nhiều trường đại học Mỹ chấp nhận cho tuyển sinh; mỗi trường tự quyết định nên cần kiểm tra với trường.", src: [1] },
      { region: "Việt Nam", text: "Chủ yếu được dùng bởi người đi du học, làm việc tại Úc, NZ và Anh. Chúng tôi không tìm được số liệu thị phần đã kiểm chứng nên không đưa ra con số.", src: [] },
    ],
  },
  vietnam: {
    title: "Thi PTE tại Việt Nam",
    points: [
      "Thi quanh năm tại TP.HCM và Hà Nội, có ít điểm thi hơn ở Đà Nẵng và Cần Thơ; mỗi điểm thi có nhiều ca thi mỗi tháng.",
      "Một điểm thi được ủy quyền cho biết có ca thi từ thứ Hai đến sáng thứ Bảy (trừ ngày lễ và Tết), 2–3 ca mỗi ngày.",
      "Các trang theo dõi lệ phí (bên thứ ba) ghi nhận 185 USD cho PTE Academic tại Việt Nam (10/2026). Luôn xác nhận giá trên trang đặt lịch của Pearson.",
    ],
    src: [11, 12, 13],
    caveat:
      "Số điểm thi khác nhau giữa các nguồn (từ 2 đến 9) và Pearson không công bố tổng số ca thi toàn quốc, nên tần suất chính xác chưa được kiểm chứng.",
  },
  comparison: {
    title: "So sánh PTE với các chứng chỉ khác",
    caption: "Số liệu chính thức khi có; lệ phí khác nhau theo quốc gia.",
    headers: ["", "PTE Academic", "IELTS Academic", "TOEFL iBT", "PTE Core"],
    rows: [
      ["Tổ chức", "Pearson", "British Council, IDP, Cambridge", "ETS", "Pearson"],
      ["Hình thức", "Máy tính, tại trung tâm", "Giấy hoặc máy tính, tại trung tâm", "Máy tính, tại trung tâm hoặc tại nhà", "Máy tính, tại trung tâm"],
      ["Thời lượng", "~2 giờ", "~2 giờ 45 phút", "Dưới ~2 giờ (định dạng 2026)", "~2 giờ"],
      ["Thang điểm", "10–90", "Band 0–9", "1–6 (từ 01/2026)", "10–90"],
      ["Speaking", "Nói vào micro, chấm bằng AI", "Thi trực tiếp với giám khảo", "Ghi âm, AI + người chấm", "Nói vào micro, chấm bằng AI"],
      ["Trả kết quả", "Thường ~2 ngày", "Vài ngày đến ~2 tuần (tùy hình thức)", "~3 ngày", "Thường ~2 ngày"],
      ["Lệ phí tại VN", "~185 USD (theo ghi nhận)", "Xem đơn vị tổ chức", "Xem ETS", "Chưa tổ chức tại VN (theo ghi nhận)"],
    ],
    src: [1, 8, 9, 10, 13],
  },
  flow: {
    title: "Nền tảng này chấm một bài thi như thế nào",
    intro:
      "Luồng dưới đây đúng với phần tổng hợp điểm trong pte-api (AggregationCore). Trọng số lấy từ mẫu đề chuẩn của nền tảng; host có thể sao chép và điều chỉnh.",
    steps: [
      { title: "1 · Điểm từng câu", text: "Mỗi câu trả lời có điểm 0–100: câu khách quan chấm tự động (có điểm từng phần với câu nhiều đáp án), câu mở được AI chấm và giám khảo có thể duyệt lại." },
      { title: "2 · Trung bình theo dạng", text: "Điểm được lấy trung bình theo từng dạng câu hỏi. Câu bỏ trống tính 0; câu chưa chấm xong thì không tính." },
      { title: "3 · Điểm kỹ năng có trọng số", text: "Mỗi kỹ năng = 10 + 80 × Σ(trọng số × trung bình / 100) / Σtrọng số, làm tròn nửa lên, trên các dạng có trọng số cho kỹ năng đó." },
      { title: "4 · Điểm tổng", text: "Overall dùng cùng công thức với trọng số tổng của từng dạng (trung bình 4 trọng số kỹ năng). Cần đủ cả 4 kỹ năng." },
    ],
    integratedTitle: "Dạng tích hợp đóng góp cho nhiều kỹ năng",
    integratedNote: "Mỗi đường thể hiện điểm trung bình của dạng câu chảy về kỹ năng nào. Đường càng dày = trọng số càng lớn.",
    simplificationsTitle: "Những điểm mô hình này đơn giản hóa so với PTE chính thức",
    simplifications: [
      "Pearson chấm theo tiêu chí (nội dung, độ trôi chảy, phát âm, ngữ pháp…) bằng mô hình độc quyền rồi quy về 10–90; ứng dụng này dùng ánh xạ tuyến tính 10 + 80 × phần trăm có trọng số.",
      "Trọng số lấy từ bảng dạng câu hỏi do cộng đồng công bố (V5), không phải của Pearson. Pearson không công bố trọng số chính xác.",
      "Pearson có thể tính một câu cho nhiều kỹ năng ở mức từng câu; ứng dụng này áp trọng số lên điểm trung bình theo dạng.",
      "Điểm ở đây là ước tính luyện tập, không tương đương bảng điểm PTE chính thức.",
    ],
  },
  simulation: {
    title: "Giả lập: chấm điểm 3 học viên",
    intro:
      "Một đề thi mini gồm 5 dạng câu hỏi (9 câu). Mỗi học viên làm từng câu Đúng, Đúng một nửa hoặc Sai. Bấm vào một câu trả lời để đổi kết quả — mọi con số ở các bước sau đều cập nhật theo. Chạy hoàn toàn trên trình duyệt, không gửi gì lên máy chủ.",
    miniNote:
      "Đề mini giữ nguyên trọng số thật của các dạng này trong mẫu đề chuẩn. Các dạng không có trong đề sẽ không được tính vào Σtrọng số, đúng như cách ứng dụng làm.",
    students: ["Học viên A", "Học viên B", "Học viên C"],
    outcomes: { correct: "Đúng · 100", partial: "Đúng một nửa · 50", wrong: "Sai · 0" },
    outcomeHint: "Bấm vào câu trả lời để đổi: Đúng → Đúng một nửa → Sai.",
    stages: ["Bài làm", "Trung bình theo dạng", "Điểm kỹ năng", "Điểm tổng"],
    previous: "Bước trước",
    next: "Bước tiếp theo",
    reset: "Khôi phục bài làm",
    item: "Câu",
    task: "Dạng câu hỏi",
    weights: "Trọng số S / W / R / L",
    averageHint: "Trung bình = tổng điểm các câu ÷ số câu",
    integrated: "Tích hợp",
    integratedNote:
      "Dạng tích hợp xuất hiện ở hai bảng kỹ năng với cùng một điểm trung bình nhưng trọng số khác nhau cho mỗi kỹ năng. Câu trả lời được tính trọn vẹn cho mỗi kỹ năng — không chia đôi.",
    viewing: "Xem phép tính của",
    weight: "Trọng số w",
    average: "Trung bình",
    contribution: "w × TB ÷ 100",
    total: "Tổng",
    formula: "Điểm = 10 + 80 × Σ(w × TB ÷ 100) ÷ Σw, làm tròn",
    overallTitle: "Điểm tổng (Overall)",
    overallNote:
      "Overall dùng trọng số tổng của từng dạng (trung bình 4 trọng số kỹ năng của dạng đó). Không phải trung bình cộng của 4 điểm kỹ năng.",
    summaryTitle: "Tổng kết kết quả",
  },
  taskNames: {
    READ_ALOUD: "Read Aloud",
    REPEAT_SENTENCE: "Repeat Sentence",
    SUMMARIZE_WRITTEN_TEXT: "Summarize Written Text",
    FILL_IN_THE_BLANKS_DROPDOWN: "Reading: Fill in the Blanks",
    WRITE_FROM_DICTATION: "Write From Dictation",
  } as Record<string, string>,
  sources: { title: "Nguồn tham khảo", note: "Nguồn bên thứ ba được ghi rõ; ưu tiên trang chính thức của Pearson, ETS, IELTS và IRCC." },
  skills: { speaking: "Speaking", writing: "Writing", reading: "Reading", listening: "Listening", overall: "Overall" },
  sections: { speakingWriting: "Speaking & Writing", reading: "Reading", listening: "Listening" },
  sourceLabel: "Nguồn",
};
