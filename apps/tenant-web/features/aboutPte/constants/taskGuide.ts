/** What the candidate does in each question type, per locale. Keys follow STANDARD_TASK_WEIGHTS. */
export interface TaskGuideEntry {
  en: string;
  vi: string;
}

export const TASK_GUIDE: Record<string, TaskGuideEntry> = {
  READ_ALOUD: {
    en: "A short text appears on screen; read it aloud into the microphone.",
    vi: "Một đoạn văn ngắn hiện trên màn hình; thí sinh đọc to đoạn văn vào micro.",
  },
  REPEAT_SENTENCE: {
    en: "Listen to a sentence once, then repeat it exactly.",
    vi: "Nghe một câu (chỉ một lần) rồi nói lại chính xác câu đó.",
  },
  DESCRIBE_IMAGE: {
    en: "Look at a chart, map or picture and describe it out loud.",
    vi: "Nhìn một biểu đồ, bản đồ hoặc hình ảnh rồi nói mô tả nó.",
  },
  RE_TELL_LECTURE: {
    en: "Listen to a short lecture, then retell it in your own words.",
    vi: "Nghe một bài giảng ngắn rồi kể lại bằng lời của mình.",
  },
  ANSWER_SHORT_QUESTION: {
    en: "Hear a simple question and answer with one or a few words.",
    vi: "Nghe một câu hỏi đơn giản và trả lời bằng một hoặc vài từ.",
  },
  SUMMARIZE_GROUP_DISCUSSION: {
    en: "Listen to several people discussing a topic, then summarise it out loud.",
    vi: "Nghe nhiều người thảo luận một chủ đề rồi nói tóm tắt cuộc thảo luận.",
  },
  RESPOND_TO_A_SITUATION: {
    en: "Read about an everyday situation and respond as you would in real life.",
    vi: "Đọc mô tả một tình huống đời thường rồi nói câu trả lời như ngoài đời thật.",
  },
  SUMMARIZE_WRITTEN_TEXT: {
    en: "Read a passage and summarise it in one written sentence.",
    vi: "Đọc một đoạn văn rồi viết tóm tắt trong một câu duy nhất.",
  },
  WRITE_ESSAY: {
    en: "Write a 200–300 word argumentative essay on a given topic.",
    vi: "Viết bài luận 200–300 từ về một chủ đề cho sẵn.",
  },
  FILL_IN_THE_BLANKS_DROPDOWN: {
    en: "Pick the right word from a drop-down list for each gap in a passage.",
    vi: "Chọn từ đúng trong danh sách thả xuống cho từng chỗ trống trong đoạn văn.",
  },
  MC_READING_MULTIPLE: {
    en: "Read a passage and choose every correct answer (more than one).",
    vi: "Đọc đoạn văn và chọn tất cả đáp án đúng (có nhiều hơn một đáp án).",
  },
  RE_ORDER_PARAGRAPHS: {
    en: "Put shuffled text boxes back into the correct order.",
    vi: "Sắp xếp lại các đoạn văn bị xáo trộn theo đúng thứ tự.",
  },
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: {
    en: "Drag words from a box into the gaps of a passage.",
    vi: "Kéo các từ trong hộp thả vào chỗ trống của đoạn văn.",
  },
  MC_READING_SINGLE: {
    en: "Read a passage and choose the single correct answer.",
    vi: "Đọc đoạn văn và chọn một đáp án đúng duy nhất.",
  },
  SUMMARIZE_SPOKEN_TEXT: {
    en: "Listen to a recording and write a 50–70 word summary.",
    vi: "Nghe một đoạn ghi âm rồi viết tóm tắt 50–70 từ.",
  },
  MC_LISTENING_MULTIPLE: {
    en: "Listen to a recording and choose every correct answer.",
    vi: "Nghe đoạn ghi âm và chọn tất cả đáp án đúng.",
  },
  FILL_IN_THE_BLANKS_TYPE_IN: {
    en: "Listen and type the missing words into a transcript.",
    vi: "Vừa nghe vừa gõ những từ còn thiếu vào bản chép lời.",
  },
  HIGHLIGHT_CORRECT_SUMMARY: {
    en: "Listen, then choose the paragraph that best summarises the recording.",
    vi: "Nghe rồi chọn đoạn văn tóm tắt đúng nhất nội dung đoạn ghi âm.",
  },
  MC_LISTENING_SINGLE: {
    en: "Listen to a recording and choose the single correct answer.",
    vi: "Nghe đoạn ghi âm và chọn một đáp án đúng duy nhất.",
  },
  SELECT_MISSING_WORD: {
    en: "The end of a recording is beeped out; choose the missing word or phrase.",
    vi: "Phần cuối đoạn ghi âm bị che bằng tiếng bíp; chọn từ hoặc cụm từ còn thiếu.",
  },
  HIGHLIGHT_INCORRECT_WORDS: {
    en: "Follow a transcript while listening and click the words that differ from the audio.",
    vi: "Vừa nghe vừa dò bản chép lời, bấm vào những từ khác với lời nói.",
  },
  WRITE_FROM_DICTATION: {
    en: "Listen to a short sentence and type it exactly as heard.",
    vi: "Nghe một câu ngắn rồi gõ lại chính xác câu đó.",
  },
};
