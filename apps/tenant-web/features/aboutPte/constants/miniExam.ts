import { STANDARD_TASK_WEIGHTS, type TaskWeight } from "./scoringWeights";

/** One answer's outcome; the app scores every item on a shared 0–100 scale. */
export type Outcome = "correct" | "partial" | "wrong";

export const OUTCOME_SCORE: Record<Outcome, number> = { correct: 100, partial: 50, wrong: 0 };
export const OUTCOME_CYCLE: Record<Outcome, Outcome> = { correct: "partial", partial: "wrong", wrong: "correct" };

/** Item count per question type in the mini exam; weights stay those of the standard template. */
const MINI_ITEMS: Record<string, number> = {
  READ_ALOUD: 2,
  REPEAT_SENTENCE: 2,
  SUMMARIZE_WRITTEN_TEXT: 1,
  FILL_IN_THE_BLANKS_DROPDOWN: 2,
  WRITE_FROM_DICTATION: 2,
};

export const MINI_TASKS: readonly TaskWeight[] = STANDARD_TASK_WEIGHTS.filter(
  (task) => task.key in MINI_ITEMS,
).map((task) => ({ ...task, items: MINI_ITEMS[task.key] }));

export type StudentAnswers = Record<string, Outcome[]>;

/** Three contrasting students: strong, mixed, weak. Keys follow MINI_TASKS. */
export const INITIAL_ANSWERS: readonly StudentAnswers[] = [
  {
    READ_ALOUD: ["correct", "correct"],
    REPEAT_SENTENCE: ["correct", "partial"],
    SUMMARIZE_WRITTEN_TEXT: ["correct"],
    FILL_IN_THE_BLANKS_DROPDOWN: ["correct", "correct"],
    WRITE_FROM_DICTATION: ["correct", "correct"],
  },
  {
    READ_ALOUD: ["correct", "partial"],
    REPEAT_SENTENCE: ["wrong", "partial"],
    SUMMARIZE_WRITTEN_TEXT: ["partial"],
    FILL_IN_THE_BLANKS_DROPDOWN: ["correct", "wrong"],
    WRITE_FROM_DICTATION: ["correct", "partial"],
  },
  {
    READ_ALOUD: ["partial", "wrong"],
    REPEAT_SENTENCE: ["wrong", "wrong"],
    SUMMARIZE_WRITTEN_TEXT: ["wrong"],
    FILL_IN_THE_BLANKS_DROPDOWN: ["partial", "wrong"],
    WRITE_FROM_DICTATION: ["partial", "wrong"],
  },
];

export const toItemScores = (answers: StudentAnswers): Record<string, number[]> =>
  Object.fromEntries(
    Object.entries(answers).map(([key, outcomes]) => [key, outcomes.map((outcome) => OUTCOME_SCORE[outcome])]),
  );
