import type { Question, QuestionFilter } from "./types";

/** Client-side search + skill/status/source filter for the question bank. */
export function filterQuestions(questions: Question[], filter: QuestionFilter): Question[] {
  const query = filter.query.trim().toLowerCase();
  return questions.filter((question) => {
    const matchesQuery =
      query === "" ||
      question.id.toLowerCase().includes(query) ||
      question.content.toLowerCase().includes(query);
    const matchesSkill = filter.skill === "all" || question.skill === filter.skill;
    const matchesStatus = filter.status === "all" || question.status === filter.status;
    const matchesSource =
      filter.source === "all" ||
      (filter.source === "ai" && question.generationMeta != null) ||
      (filter.source === "manual" && question.generationMeta == null);
    return matchesQuery && matchesSkill && matchesStatus && matchesSource;
  });
}
