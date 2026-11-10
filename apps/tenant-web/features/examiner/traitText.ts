export const EXAMINER_TRAIT_TEXT = {
  en: { title: "Rubric traits", choose: "Choose a band", machine: "Azure Speech by default",
    azureNote: "Preset to the band Azure Speech measured from the recording (its 0–5 mapping is not yet calibrated against human scores). Choose another band if you disagree.", form: "Mechanical Form · read only",
    missingAi: "A matching machine score is required for pronunciation and fluency.", server: "Item score", gate: "Zero gate triggered by", pending: "Complete the traits to save and calculate the item score.", autosave: "Complete changes save automatically.", contribution: "Contribution", weight: "Weight",
    aiBadge: "AI", gapHint: "Your band is 2 or more away from the AI. Note why; the reasons are used to calibrate the AI.",
    gapPlaceholder: "Why does this trait deserve a different band?", aiReason: "AI reasoning", gapSaved: "Reason for differing from the AI", aiEvidence: "Quoted from the answer",
    formula: "Item score = Σ (band × weight) ÷ Σ (maximum × weight) × 100", blindTitle: "Blind marking",
    blindHint: "The AI score and evidence open after you choose every trait, so it does not anchor your judgement.", revealNow: "Show AI now",
    colPrompt: "Question & answer", colAi: "AI's marking", colExaminer: "Examiner's marking", metaTask: "Task type",
    metaSection: "Skill", metaCefr: "CEFR level", metaWords: "Word limit", metaOrder: "Question", metaCefrNone: "Not classified" },
  vi: { title: "Chấm theo tiêu chí", choose: "Chọn mức điểm", machine: "Mặc định Azure Speech",
    azureNote: "Đã chọn sẵn mức Azure Speech đo từ bản ghi âm (bảng quy đổi 0–5 chưa hiệu chỉnh với điểm người chấm). Chọn mức khác nếu bạn không đồng ý.", form: "Form cơ học · chỉ đọc",
    missingAi: "Cần điểm máy cùng phiên bản cho phát âm và độ trôi chảy.", server: "Điểm câu", gate: "Cổng điểm 0 kích hoạt bởi", pending: "Chọn đủ tiêu chí để lưu và tính điểm câu.", autosave: "Thay đổi đủ tiêu chí được lưu tự động.", contribution: "Đóng góp", weight: "Trọng số",
    aiBadge: "AI", gapHint: "Bạn lệch AI từ 2 mức trở lên. Ghi lý do; lý do được dùng để hiệu chỉnh AI.",
    gapPlaceholder: "Vì sao tiêu chí này đáng một mức khác?", aiReason: "Lý do của AI", gapSaved: "Lý do lệch AI", aiEvidence: "Trích từ bài làm",
    formula: "Điểm câu = Σ (mức × trọng số) ÷ Σ (tối đa × trọng số) × 100", blindTitle: "Chấm mù",
    blindHint: "Điểm và căn cứ của AI chỉ mở sau khi bạn chọn đủ các tiêu chí, để AI không ảnh hưởng nhận định của bạn.", revealNow: "Xem AI ngay",
    colPrompt: "Đề & bài làm", colAi: "Phần chấm của AI", colExaminer: "Phần chấm của giám khảo", metaTask: "Dạng bài",
    metaSection: "Kỹ năng", metaCefr: "Mức CEFR", metaWords: "Giới hạn từ", metaOrder: "Câu", metaCefrNone: "Chưa phân loại" },
};

export type ExaminerTraitText = (typeof EXAMINER_TRAIT_TEXT)["en"];
