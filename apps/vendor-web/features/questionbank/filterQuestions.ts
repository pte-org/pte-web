import type { Question, QuestionFilter } from "./types";

/** Client-side search + skill/difficulty/status filter for the question bank. */
export function filterQuestions(questions: Question[], filter: QuestionFilter): Question[] {
  const query = filter.query.trim().toLowerCase();
  return questions.filter((question) => {
    const matchesQuery =
      query === "" ||
      question.id.toLowerCase().includes(query) ||
      question.content.toLowerCase().includes(query);
    const matchesSkill = filter.skill === "all" || question.skill === filter.skill;
    // A null difficulty (backend has no such data yet — see api.ts's
    // mapQuestion) never matches a specific filter value, only "all".
    const matchesDifficulty =
      filter.difficulty === "all" ||
      (question.difficulty !== null && question.difficulty === filter.difficulty);
    const matchesStatus = filter.status === "all" || question.status === filter.status;
    return matchesQuery && matchesSkill && matchesDifficulty && matchesStatus;
  });
}
