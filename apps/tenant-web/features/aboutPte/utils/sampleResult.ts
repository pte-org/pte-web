import { INITIAL_ANSWERS, SIM_TASKS, toItemScores } from "../constants/miniExam";
import { scoreAttempt, type ScoredResult } from "./scoringEngine";

/** Student B of the step-by-step simulation: the real scores shown as the page's sample report. */
export const SAMPLE_RESULT: ScoredResult = scoreAttempt(SIM_TASKS, toItemScores(INITIAL_ANSWERS[1]));
