/**
 * The names the catalogue gives the task types, so the template table reads the same as the question bank and the
 * scoring rubric ("Re-tell Lecture", "Respond to a Situation"). A code that is not listed falls back to its words.
 */
const TASK_TYPE_NAMES: Readonly<Record<string, string>> = {
  READ_ALOUD: "Read Aloud",
  REPEAT_SENTENCE: "Repeat Sentence",
  DESCRIBE_IMAGE: "Describe Image",
  RE_TELL_LECTURE: "Re-tell Lecture",
  ANSWER_SHORT_QUESTION: "Answer Short Question",
  SUMMARIZE_GROUP_DISCUSSION: "Summarize Group Discussion",
  RESPOND_TO_A_SITUATION: "Respond to a Situation",
  PERSONAL_INTRODUCTION: "Personal Introduction",
  SUMMARIZE_WRITTEN_TEXT: "Summarize Written Text",
  WRITE_ESSAY: "Write Essay",
  FILL_IN_THE_BLANKS_DROPDOWN: "Fill in the Blanks (Dropdown)",
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: "Fill in the Blanks (Drag and Drop)",
  FILL_IN_THE_BLANKS_TYPE_IN: "Fill in the Blanks (Type In)",
  MC_READING_MULTIPLE: "Multiple-choice Reading (Multiple)",
  MC_READING_SINGLE: "Multiple-choice Reading (Single)",
  RE_ORDER_PARAGRAPHS: "Re-order Paragraphs",
  SUMMARIZE_SPOKEN_TEXT: "Summarize Spoken Text",
  MC_LISTENING_MULTIPLE: "Multiple-choice Listening (Multiple)",
  MC_LISTENING_SINGLE: "Multiple-choice Listening (Single)",
  HIGHLIGHT_CORRECT_SUMMARY: "Highlight Correct Summary",
  SELECT_MISSING_WORD: "Select Missing Word",
  HIGHLIGHT_INCORRECT_WORDS: "Highlight Incorrect Words",
  WRITE_FROM_DICTATION: "Write From Dictation",
};

/** READ_ALOUD -> "Read Aloud": the template stores task types as codes; the table shows readable names. */
export const taskTypeLabel = (code: string): string =>
  TASK_TYPE_NAMES[code.toUpperCase()] ??
  code.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
