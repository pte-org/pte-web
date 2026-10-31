import type { QuestionPool, QuestionResponse } from "@pte/api-client";

type PoolSource = Pick<QuestionResponse, "pool" | "availableForExam" | "availableForPractice">;

/**
 * The pool a question currently serves. The availability flags win over the
 * immutable `pool` column because a draft can be moved after creation; when
 * both or neither flag is set the creation pool is the best remaining signal.
 */
export function resolveCurrentPool(question: PoolSource): QuestionPool {
  const { availableForExam, availableForPractice } = question;
  if (availableForPractice === true && availableForExam === false) return "PRACTICE";
  if (availableForExam === true && availableForPractice === false) return "EXAM";
  return question.pool === "PRACTICE" ? "PRACTICE" : "EXAM";
}

export function poolToAvailability(pool: QuestionPool): {
  availableForExam: boolean;
  availableForPractice: boolean;
} {
  return { availableForExam: pool === "EXAM", availableForPractice: pool === "PRACTICE" };
}
