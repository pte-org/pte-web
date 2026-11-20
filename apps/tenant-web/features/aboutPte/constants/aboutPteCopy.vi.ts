import type { AboutPteCopy } from "./aboutPteCopy.en";

/** Bản tiếng Việt của trang Giới thiệu PTE. Số trong `src` là id trong ABOUT_PTE_SOURCES. */
export const ABOUT_PTE_VI: AboutPteCopy = {
  nav: "Về PTE",
  hero: {
    eyebrow: "Hiểu về kỳ thi đằng sau đồ án này",
    title: "PTE là gì và được chấm điểm ra sao?",
    description:
      "Tổng quan có dẫn nguồn về Pearson Test of English: ai tổ chức, được công nhận ở đâu, khác gì các chứng chỉ khác và nền tảng này quy đổi bài làm thành điểm 10–90 như thế nào.",
    toc: ["Tổng quan", "Cho người mới", "Lịch sử", "Công nhận", "Tại Việt Nam", "So sánh", "Luồng chấm điểm", "Giả lập", "Nguồn"],
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
  basics: {
    title: "PTE cho người mới bắt đầu",
    intro:
      "Chưa từng biết về PTE? Chỉ cần nắm 4 ý dưới đây là đủ để theo dõi phần còn lại của trang.",
    concepts: [
      { title: "1 · Một buổi thi, ba phần", text: "Thí sinh ngồi trước máy tính, đeo tai nghe có micro, làm bài khoảng 2 giờ: phần 1 Nói & Viết, phần 2 Đọc, phần 3 Nghe. Không có giám khảo ngồi hỏi trực tiếp." },
      { title: "2 · Báo điểm 4 kỹ năng", text: "Bảng điểm có 4 điểm kỹ năng — Speaking (Nói), Writing (Viết), Reading (Đọc), Listening (Nghe) — và 1 điểm tổng Overall." },
      { title: "3 · Một câu có thể được tính hai lần", text: "Nhiều dạng câu kiểm tra cùng lúc hai kỹ năng. Ví dụ Write From Dictation: thí sinh nghe (Listening) rồi gõ lại (Writing), nên điểm câu đó được tính cho cả hai kỹ năng. Đây gọi là dạng câu tích hợp." },
      { title: "4 · Thang điểm từ 10 đến 90", text: "10 là điểm thấp nhất, 90 là cao nhất. Trường đại học hay chương trình thị thực sẽ yêu cầu mức tối thiểu, ví dụ Overall 65." },
    ],
    guideTitle: "22 dạng câu hỏi trong một bảng",
    guideIntro: "Thí sinh phải làm gì ở mỗi dạng câu và dạng đó được tính điểm cho kỹ năng nào trên nền tảng này. Mỗi ô màu là một kỹ năng; có hai ô màu = dạng tích hợp.",
    feeds: "Tính điểm cho",
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
    title: "Giả lập: chấm điểm 3 học viên với đủ 22 dạng câu hỏi",
    intro:
      "Ba học viên làm cùng một đề gồm đủ 22 dạng câu hỏi của PTE. Đi qua 4 bước để thấy bài làm biến thành điểm 10–90 như thế nào. Bạn có thể bấm vào bất kỳ câu trả lời nào để đổi kết quả; mọi con số phía sau sẽ tự tính lại. Mọi thứ chạy trên trình duyệt.",
    students: ["Học viên A", "Học viên B", "Học viên C"],
    outcomes: { correct: "Đúng · 100", partial: "Đúng một nửa · 50", wrong: "Sai · 0" },
    stages: ["Bài làm", "Trung bình theo dạng", "Điểm kỹ năng", "Điểm tổng"],
    explain: [
      "Mỗi câu trả lời được chấm từ 0 đến 100. Ở đây dùng 3 trường hợp: đúng hoàn toàn = 100, đúng một nửa = 50 (ví dụ điền đúng 2/4 chỗ trống), sai hoặc bỏ trống = 0. Bấm vào câu trả lời để đổi.",
      "Các câu cùng một dạng được lấy trung bình. Ví dụ: hai câu Repeat Sentence được 100 và 50 thì trung bình là (100 + 50) ÷ 2 = 75. Từ bước này hệ thống chỉ làm việc với 22 điểm trung bình này, không xét từng câu nữa.",
      "Mỗi dạng câu có một trọng số cho từng kỹ năng (số nhỏ màu xám). Mỗi ô cho biết dạng đó góp bao nhiêu điểm vào kỹ năng: trung bình × trọng số ÷ 100. Dòng có hai ô màu là dạng tích hợp: cùng một điểm trung bình được tính cho cả hai kỹ năng, mỗi kỹ năng theo trọng số riêng. Các dòng cuối cộng cả cột lại và quy đổi ra thang 10–90.",
      "Overall tính y hệt một kỹ năng, nhưng dùng trọng số tổng của từng dạng (trung bình 4 trọng số kỹ năng của dạng đó). Overall không phải trung bình cộng của 4 điểm kỹ năng.",
    ],
    example: "Ví dụ",
    exampleText: (task: string, average: string, parts: string) =>
      `${task} có điểm trung bình ${average}, nên góp ${parts}.`,
    and: " và ",
    to: "vào",
    previous: "Bước trước",
    next: "Bước tiếp theo",
    reset: "Khôi phục bài làm",
    item: "Câu",
    task: "Dạng câu hỏi",
    weights: "Trọng số S / W / R / L",
    integrated: "Tích hợp",
    viewing: "Xem phép tính của",
    average: "Trung bình",
    weight: "w",
    totalWeight: "Tổng trọng số (Σw)",
    totalPoints: "Tổng điểm góp",
    ratio: "Tỉ lệ = Tổng điểm góp ÷ Σw",
    score: "Điểm = 10 + 80 × tỉ lệ",
    summaryTitle: "Tổng kết kết quả",
  },
  sources: { title: "Nguồn tham khảo", note: "Nguồn bên thứ ba được ghi rõ; ưu tiên trang chính thức của Pearson, ETS, IELTS và IRCC." },
  skills: { speaking: "Speaking", writing: "Writing", reading: "Reading", listening: "Listening", overall: "Overall" },
  sections: { speakingWriting: "Speaking & Writing", reading: "Reading", listening: "Listening" },
  sourceLabel: "Nguồn",
};
