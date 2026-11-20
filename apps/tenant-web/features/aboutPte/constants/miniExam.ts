import { STANDARD_TASK_WEIGHTS, type TaskWeight } from "./scoringWeights";

/** One answer's outcome; the app scores every item on a shared 0–100 scale. */
export type Outcome = "correct" | "partial" | "wrong";

export const OUTCOME_SCORE: Record<Outcome, number> = { correct: 100, partial: 50, wrong: 0 };
export const OUTCOME_CYCLE: Record<Outcome, Outcome> = { correct: "partial", partial: "wrong", wrong: "correct" };

/** Long-response question types get one item; every other type gets two, to keep the grid readable. */
const SINGLE_ITEM_TASKS = new Set(["WRITE_ESSAY", "SUMMARIZE_WRITTEN_TEXT", "SUMMARIZE_SPOKEN_TEXT"]);
const DEFAULT_ITEMS = 2;

/** All 22 question types with their real standard-template weights. */
export const SIM_TASKS: readonly TaskWeight[] = STANDARD_TASK_WEIGHTS.map((task) => ({
  ...task,
  items: SINGLE_ITEM_TASKS.has(task.key) ? 1 : DEFAULT_ITEMS,
}));

export type StudentAnswers = Record<string, Outcome[]>;

/** Repeating answer patterns: a strong, a mixed and a weak student. */
const PATTERNS: readonly (readonly Outcome[])[] = [
  ["correct", "correct", "correct", "partial", "correct", "correct", "correct"],
  ["correct", "partial", "wrong", "correct", "partial", "correct"],
  ["partial", "wrong", "wrong", "correct", "wrong", "partial", "wrong"],
];

const buildAnswers = (pattern: readonly Outcome[]): StudentAnswers => {
  let position = 0;
  return Object.fromEntries(
    SIM_TASKS.map((task) => [
      task.key,
      Array.from({ length: task.items }, () => pattern[position++ % pattern.length]),
    ]),
  );
};

export const INITIAL_ANSWERS: readonly StudentAnswers[] = PATTERNS.map(buildAnswers);

export const toItemScores = (answers: StudentAnswers): Record<string, number[]> =>
  Object.fromEntries(
    Object.entries(answers).map(([key, outcomes]) => [key, outcomes.map((outcome) => OUTCOME_SCORE[outcome])]),
  );

/** Official question-type names (identical in both languages). */
export const TASK_NAMES: Record<string, string> = {
  READ_ALOUD: "Read Aloud",
  REPEAT_SENTENCE: "Repeat Sentence",
  DESCRIBE_IMAGE: "Describe Image",
  RE_TELL_LECTURE: "Re-tell Lecture",
  ANSWER_SHORT_QUESTION: "Answer Short Question",
  SUMMARIZE_GROUP_DISCUSSION: "Summarize Group Discussion",
  RESPOND_TO_A_SITUATION: "Respond to a Situation",
  SUMMARIZE_WRITTEN_TEXT: "Summarize Written Text",
  WRITE_ESSAY: "Write Essay",
  FILL_IN_THE_BLANKS_DROPDOWN: "Reading & Writing: Fill in the Blanks",
  MC_READING_MULTIPLE: "Reading: Multiple Choice, Multiple Answers",
  RE_ORDER_PARAGRAPHS: "Re-order Paragraphs",
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: "Reading: Fill in the Blanks",
  MC_READING_SINGLE: "Reading: Multiple Choice, Single Answer",
  SUMMARIZE_SPOKEN_TEXT: "Summarize Spoken Text",
  MC_LISTENING_MULTIPLE: "Listening: Multiple Choice, Multiple Answers",
  FILL_IN_THE_BLANKS_TYPE_IN: "Listening: Fill in the Blanks",
  HIGHLIGHT_CORRECT_SUMMARY: "Highlight Correct Summary",
  MC_LISTENING_SINGLE: "Listening: Multiple Choice, Single Answer",
  SELECT_MISSING_WORD: "Select Missing Word",
  HIGHLIGHT_INCORRECT_WORDS: "Highlight Incorrect Words",
  WRITE_FROM_DICTATION: "Write From Dictation",
};
