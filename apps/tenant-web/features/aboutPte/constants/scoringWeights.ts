/**
 * Mirror of the platform's ACTIVE standard exam template (pte-api migration
 * V24__correct_standard_exam_template.sql). Each skill column sums to 100; `items` is the
 * representative item count used by the client-side simulation (lower bound of min..max).
 */
export type SkillKey = "speaking" | "writing" | "reading" | "listening";
export type SectionKey = "speakingWriting" | "reading" | "listening";

export interface TaskWeight {
  key: string;
  section: SectionKey;
  items: number;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
  overall: number;
}

export const SKILLS: readonly SkillKey[] = ["speaking", "writing", "reading", "listening"];

export const SCORE_FLOOR = 10;
export const SCORE_SPAN = 80;

export const STANDARD_TASK_WEIGHTS: readonly TaskWeight[] = [
  { key: "READ_ALOUD", section: "speakingWriting", items: 6, speaking: 14, writing: 0, reading: 0, listening: 0, overall: 3.5 },
  { key: "REPEAT_SENTENCE", section: "speakingWriting", items: 10, speaking: 20, writing: 0, reading: 0, listening: 19, overall: 9.75 },
  { key: "DESCRIBE_IMAGE", section: "speakingWriting", items: 5, speaking: 34, writing: 0, reading: 0, listening: 0, overall: 8.5 },
  { key: "RE_TELL_LECTURE", section: "speakingWriting", items: 2, speaking: 11, writing: 0, reading: 0, listening: 10, overall: 5.25 },
  { key: "ANSWER_SHORT_QUESTION", section: "speakingWriting", items: 5, speaking: 0, writing: 0, reading: 0, listening: 5, overall: 1.25 },
  { key: "SUMMARIZE_GROUP_DISCUSSION", section: "speakingWriting", items: 2, speaking: 13, writing: 0, reading: 0, listening: 15, overall: 7 },
  { key: "RESPOND_TO_A_SITUATION", section: "speakingWriting", items: 2, speaking: 8, writing: 0, reading: 0, listening: 0, overall: 2 },
  { key: "SUMMARIZE_WRITTEN_TEXT", section: "speakingWriting", items: 2, speaking: 0, writing: 25.5, reading: 19, listening: 0, overall: 11.13 },
  { key: "WRITE_ESSAY", section: "speakingWriting", items: 1, speaking: 0, writing: 25.5, reading: 0, listening: 0, overall: 6.38 },
  { key: "FILL_IN_THE_BLANKS_DROPDOWN", section: "reading", items: 5, speaking: 0, writing: 0, reading: 28, listening: 0, overall: 7 },
  { key: "MC_READING_MULTIPLE", section: "reading", items: 2, speaking: 0, writing: 0, reading: 6, listening: 0, overall: 1.5 },
  { key: "RE_ORDER_PARAGRAPHS", section: "reading", items: 2, speaking: 0, writing: 0, reading: 8, listening: 0, overall: 2 },
  { key: "FILL_IN_THE_BLANKS_DRAG_AND_DROP", section: "reading", items: 4, speaking: 0, writing: 0, reading: 18, listening: 0, overall: 4.5 },
  { key: "MC_READING_SINGLE", section: "reading", items: 2, speaking: 0, writing: 0, reading: 2, listening: 0, overall: 0.5 },
  { key: "SUMMARIZE_SPOKEN_TEXT", section: "listening", items: 1, speaking: 0, writing: 23, reading: 0, listening: 10, overall: 8.25 },
  { key: "MC_LISTENING_MULTIPLE", section: "listening", items: 2, speaking: 0, writing: 0, reading: 0, listening: 4, overall: 1 },
  { key: "FILL_IN_THE_BLANKS_TYPE_IN", section: "listening", items: 2, speaking: 0, writing: 0, reading: 0, listening: 9, overall: 2.25 },
  { key: "HIGHLIGHT_CORRECT_SUMMARY", section: "listening", items: 2, speaking: 0, writing: 0, reading: 3, listening: 1, overall: 1 },
  { key: "MC_LISTENING_SINGLE", section: "listening", items: 2, speaking: 0, writing: 0, reading: 0, listening: 1, overall: 0.25 },
  { key: "SELECT_MISSING_WORD", section: "listening", items: 1, speaking: 0, writing: 0, reading: 0, listening: 1, overall: 0.25 },
  { key: "HIGHLIGHT_INCORRECT_WORDS", section: "listening", items: 2, speaking: 0, writing: 0, reading: 16, listening: 11, overall: 6.75 },
  { key: "WRITE_FROM_DICTATION", section: "listening", items: 3, speaking: 0, writing: 26, reading: 0, listening: 14, overall: 10 },
];

export const contributingSkills = (task: TaskWeight): SkillKey[] =>
  SKILLS.filter((skill) => task[skill] > 0);
